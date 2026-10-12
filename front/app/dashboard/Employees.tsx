// Este componente es un alias de AdminUsers
// Se mantiene por compatibilidad con rutas existentes
import AdminUsers from './AdminUsers';

export default function Employees() {
  return AdminUsers();
}
