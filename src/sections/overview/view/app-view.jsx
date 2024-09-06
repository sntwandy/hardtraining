import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { supabase } from '../../../lib/supabase.ts';
import AppWidgetSummary from '../app-widget-summary'; // Supabase client

export default function AppView() {
  // Estados para almacenar los datos de los clientes
  const [totalClientes, setTotalClientes] = useState(0);
  const [clientesPagos, setClientesPagos] = useState(0);
  const [clientesPendientes, setClientesPendientes] = useState(0);

  // Función para obtener los clientes de la base de datos
  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clients').select('*'); // Ajusta el nombre de tu tabla
    if (error) {
      console.error(error);
    } else {
      // Total de clientes
      setTotalClientes(data.length);

      // Calcular cuántos clientes están pagos y cuántos pendientes
      const now = new Date();
      const pagos = data.filter((cliente) => {
        const lastPayment = new Date(cliente.last_payment);
        return lastPayment <= now; // Pagados si la fecha de pago es mayor o igual a hoy
      });

      const pendientes = data.length - pagos.length; // Pendientes son los demás

      setClientesPagos(pagos.length);
      setClientesPendientes(pendientes > 0 ? pendientes : 0);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" sx={{ mb: 5 }}>
        Hola, bienvenido 👋
      </Typography>

      <Typography variant="h4" sx={{ mb: 2 }}>
        Resumen de Clientes
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Registrados"
            total={totalClientes}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Pagos $"
            total={clientesPagos}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Pendientes $"
            total={clientesPendientes}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
