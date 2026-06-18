import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../styles/shared/alerts.css';

const MySwal = withReactContent(Swal);

// Instancia base con colores oscuros y bordes redondeados
export const showAlert = MySwal.mixin({
  background: '#1a1a1a',
  color: '#ffffff',
  confirmButtonColor: '#f97316',
  cancelButtonColor: '#333333',
  customClass: {
    popup: 'swal-dark-popup',
    title: 'swal-dark-title',
    htmlContainer: 'swal-dark-html',
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel',
  },
  showClass: {
    popup: 'swal2-show anim-scale-up',
  },
  hideClass: {
    popup: 'swal2-hide anim-scale-down',
  },
});

export default showAlert;
