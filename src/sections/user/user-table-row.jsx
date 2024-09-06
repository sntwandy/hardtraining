import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { supabase } from 'src/lib/supabase.ts';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  selected,
  userId,
  name,
  avatarUrl,
  location,
  role,
  upToDatePay,
  status,
  handleClick,
  phoneNumber, // Nuevo prop para el número de teléfono
  refreshClients,
}) {
  const [open, setOpen] = useState(null);
  const [paymentPopoverOpen, setPaymentPopoverOpen] = useState(null);
  const [dueMonths, setDueMonths] = useState([]);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpenPaymentPopover = async (event) => {
    setPaymentPopoverOpen(event.currentTarget);
    const { data, error } = await supabase
      .from('clients')
      .select('last_payment, pay_day')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user payment data:', error);
      return;
    }

    const lastPaymentDate = new Date(data.last_payment);
    const currentDate = new Date();
    const monthsDue = [];

    while (lastPaymentDate < currentDate) {
      lastPaymentDate.setMonth(lastPaymentDate.getMonth() + 1);
      if (lastPaymentDate < currentDate) {
        monthsDue.push({
          monthName: lastPaymentDate.toLocaleString('default', { month: 'long' }),
          monthIndex: lastPaymentDate.getMonth(),
        });
      }
    }

    setDueMonths(monthsDue);
  };

  const handleClosePaymentPopover = () => {
    setPaymentPopoverOpen(null);
  };

  const handlePayMonth = async (monthIndex) => {
    if (monthIndex !== dueMonths[0].monthIndex) {
      console.error('Debes pagar los meses pendientes en orden.');
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('pay_day')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user pay_day:', error);
      return;
    }

    const newPaymentDate = new Date();
    newPaymentDate.setMonth(monthIndex);
    newPaymentDate.setFullYear(new Date().getFullYear());
    newPaymentDate.setDate(data.pay_day);

    const { error: updateError } = await supabase
      .from('clients')
      .update({ last_payment: newPaymentDate })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating payment date:', updateError);
    } else {
      console.log('Payment date updated successfully');
      refreshClients();
      handleClosePaymentPopover();
    }
  };

  const handleDeleteUser = async () => {
    const { error } = await supabase.from('clients').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
    } else {
      console.log('User deleted successfully');
      refreshClients();
      handleCloseMenu();
    }
  };

  // Formatear el número de teléfono para la URL de WhatsApp
  const handleContactWhatsApp = () => {
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Elimina caracteres no numéricos
    alert(phoneNumber);
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}`;
    window.open(whatsappUrl, '_blank'); // Abre WhatsApp en una nueva pestaña
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{location}</TableCell>

        <TableCell align="center">
          <Label color={upToDatePay === false ? 'error' : 'success'}>
            {upToDatePay ? 'Sí' : 'No'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleOpenPaymentPopover}>
          <Iconify icon="eva:checkmark-circle-2-outline" sx={{ mr: 2 }} />
          Pagar
        </MenuItem>
        {/* Nuevo MenuItem para contactar por WhatsApp */}
        <MenuItem onClick={handleContactWhatsApp}>
          <Iconify icon="eva:message-circle-outline" sx={{ mr: 2 }} />
            WhatsApp
        </MenuItem>
      </Popover>

      <Popover
        open={!!paymentPopoverOpen}
        anchorEl={paymentPopoverOpen}
        onClose={handleClosePaymentPopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { padding: 2 },
        }}
      >
        {dueMonths.length > 0 ? (
          dueMonths.map((month, index) => (
            <Button
              key={index}
              fullWidth
              onClick={() => handlePayMonth(month.monthIndex)}
              disabled={index > 0} // Deshabilita los meses que no son el primero pendiente
            >
              {month.monthName}
            </Button>
          ))
        ) : (
          <Typography>No hay pagos pendientes.</Typography>
        )}
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  location: PropTypes.any,
  handleClick: PropTypes.func,
  upToDatePay: PropTypes.bool,
  name: PropTypes.any,
  role: PropTypes.any,
  userId: PropTypes.number,
  phoneNumber: PropTypes.string, // Añadir phoneNumber como prop
  selected: PropTypes.any,
  status: PropTypes.string,
  refreshClients: PropTypes.func,
};
