const fs = require('fs');
const path = require('path');
const readline = require('readline');
const forge = require('node-forge');
require('dotenv').config();

const certsDir = path.resolve(__dirname, '../certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultValue) {
  return new Promise(resolve => {
    rl.question(`${question} [${defaultValue}]: `, answer => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  console.log('\n======================================================');
  console.log('   Generador de Clave Privada y CSR para ARCA / AFIP');
  console.log('======================================================\n');

  const defaultCuit = process.env.ARCA_CUIT || '20111111112';
  const defaultEmpresa = 'Pumax';
  const defaultAlias = 'Pumax';

  const cuit = await ask('1. Ingrese su CUIT (11 dígitos sin guiones)', defaultCuit);
  const empresa = await ask('2. Nombre de la Empresa o Titular', defaultEmpresa);
  const alias = await ask('3. Nombre del Computador Fiscal / Alias', defaultAlias);

  rl.close();

  console.log('\n⏳ Generando par de claves RSA de 2048 bits...');
  const pki = forge.pki;
  const keys = pki.rsa.generateKeyPair(2048);

  console.log('⏳ Creando solicitud de certificado (CSR / PKCS#10)...');
  const csr = pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    { name: 'countryName', value: 'AR' },
    { name: 'organizationName', value: empresa },
    { name: 'commonName', value: alias },
    { name: 'serialNumber', value: `CUIT ${cuit}` }
  ]);

  // Firmar el CSR con la clave privada creada
  csr.sign(keys.privateKey, forge.md.sha256.create());

  const keyPem = pki.privateKeyToPem(keys.privateKey);
  const csrPem = pki.certificationRequestToPem(csr);

  const keyFile = path.join(certsDir, 'arca.key');
  const csrFile = path.join(certsDir, 'pedido.csr');

  fs.writeFileSync(keyFile, keyPem, 'utf8');
  fs.writeFileSync(csrFile, csrPem, 'utf8');

  console.log('\n✅ ¡Archivos generados con éxito en la carpeta "back/certs/"!');
  console.log(`   🔑 Clave Privada : ${keyFile}`);
  console.log(`   📝 Solicitud CSR : ${csrFile}`);

  console.log('\n======================================================');
  console.log('           PASOS SIGUIENTES EN LA WEB DE ARCA');
  console.log('======================================================');
  console.log('\n1. Ingresa a la web de ARCA / AFIP con tu Clave Fiscal.');
  console.log('2. Entra al servicio: "Administración de Certificados Digitales".');
  console.log(`3. Haz clic en "Agregar Alias", escribe "${alias}" y en el campo "CSR"`);
  console.log(`   sube el archivo que acabamos de generar:`);
  console.log(`   👉 ${csrFile}`);
  console.log('4. Una vez creado, haz clic en "Ver" y DESCARGA el certificado.');
  console.log('5. Guarda el archivo descargado exactamente en:');
  console.log(`   👉 ${path.join(certsDir, 'arca.crt')}`);
  console.log('\n6. Finalmente, en ARCA ingresa a: "Administrador de Relaciones de Clave Fiscal"');
  console.log('   y autoriza el servicio "Facturación Electrónica" vinculándolo al Alias creado.');
  console.log('\n¡Y listo! El sistema reconocerá automáticamente los certificados.\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
