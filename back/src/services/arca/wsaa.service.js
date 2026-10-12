const fs = require('fs');
const forge = require('node-forge');
const { XMLParser } = require('fast-xml-parser');
const config = require('./config');

// Caché en memoria del Token de Acceso (válido 12hs)
let cachedTicket = null;

/**
 * Genera el XML del Ticket de Requerimiento de Acceso (TRA)
 */
function generarTRA() {
  const ahora = Date.now();
  // Fecha generación: 10 minutos atrás para tolerar desfase de reloj
  const genTime = new Date(ahora - 10 * 60 * 1000).toISOString();
  // Fecha expiración: 10 minutos en el futuro para la validez de la solicitud
  const expTime = new Date(ahora + 10 * 60 * 1000).toISOString();
  const uniqueId = Math.floor(ahora / 1000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${genTime}</generationTime>
    <expirationTime>${expTime}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;
}

/**
 * Firma el XML en formato PKCS#7 / CMS codificado en Base64
 */
function firmarTRA(traXml, certPem, keyPem) {
  const cert = forge.pki.certificateFromPem(certPem);
  const privateKey = forge.pki.privateKeyFromPem(keyPem);

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(traXml, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data
      },
      {
        type: forge.pki.oids.messageDigest
      },
      {
        type: forge.pki.oids.signingTime,
        value: new Date()
      }
    ]
  });

  p7.sign();
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return forge.util.encode64(der);
}

/**
 * Obtiene credenciales activas (Token + Sign) desde WSAA con caché de 12hs
 */
async function obtenerCredenciales() {
  // 1. Si hay ticket en caché vigente por al menos 10 minutos más, reutilizarlo
  if (cachedTicket && new Date(cachedTicket.expirationTime) > new Date(Date.now() + 10 * 60 * 1000)) {
    return {
      token: cachedTicket.token,
      sign: cachedTicket.sign,
      cuit: config.cuit,
      simulado: false
    };
  }

  // 2. Comprobar si existen los certificados físicos
  const certExiste = fs.existsSync(config.certPath);
  const keyExiste = fs.existsSync(config.keyPath);

  if (!certExiste || !keyExiste || config.env === 'simulado') {
    // Si no están los certificados, devolvemos credenciales simuladas para no bloquear el desarrollo
    return {
      token: 'TOKEN_SIMULADO_' + Date.now(),
      sign: 'SIGN_SIMULADO_' + Date.now(),
      cuit: config.cuit,
      simulado: true
    };
  }

  // 3. Flujo real con WSAA
  try {
    const certPem = fs.readFileSync(config.certPath, 'utf8');
    const keyPem = fs.readFileSync(config.keyPath, 'utf8');

    const traXml = generarTRA();
    const cmsBase64 = firmarTRA(traXml, certPem, keyPem);

    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cmsBase64}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch(config.urls.wsaa, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      body: soapRequest
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`WSAA HTTP Error ${response.status}: ${responseText}`);
    }

    // Parsear respuesta XML
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedSoap = parser.parse(responseText);

    const body = parsedSoap['soapenv:Envelope']?.['soapenv:Body'] || parsedSoap['soap:Envelope']?.['soap:Body'];
    const fault = body?.['soapenv:Fault'] || body?.['soap:Fault'];

    if (fault) {
      const faultString = fault.faultstring || 'Error en autenticación WSAA';
      throw new Error(`Fallo de autenticación en ARCA (WSAA): ${faultString}`);
    }

    // loginCmsReturn contiene el XML interno de respuesta
    const loginCmsReturn = body?.['loginCmsResponse']?.['loginCmsReturn'] || body?.['wsaa:loginCmsResponse']?.['loginCmsReturn'];

    if (!loginCmsReturn) {
      throw new Error(`Respuesta inesperada de WSAA: ${responseText}`);
    }

    const ticketParsed = parser.parse(loginCmsReturn);
    const loginTicket = ticketParsed.loginTicketResponse;

    const token = loginTicket.credentials.token;
    const sign = loginTicket.credentials.sign;
    const expirationTime = loginTicket.header.expirationTime;

    // Guardar en caché
    cachedTicket = {
      token,
      sign,
      expirationTime
    };

    console.log(`✓ Credenciales ARCA obtenidas exitosamente (Vigentes hasta: ${expirationTime})`);

    return {
      token,
      sign,
      cuit: config.cuit,
      simulado: false
    };

  } catch (error) {
    console.error('✗ Error conectando a WSAA:', error.message);
    throw error;
  }
}

/**
 * Invalida la caché del token (en caso de error de sesión o prueba)
 */
function limpiarCache() {
  cachedTicket = null;
}

module.exports = {
  obtenerCredenciales,
  limpiarCache,
  generarTRA
};
