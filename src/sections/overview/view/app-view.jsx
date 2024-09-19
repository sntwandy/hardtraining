import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Import Link for navigation
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

  // Estados para almacenar el total por cada sucursal
  const [clubAmigosLeales, setClubAmigosLeales] = useState(0);
  const [estadioOlimpico, setEstadioOlimpico] = useState(0);
  const [laLoteria, setLaLoteria] = useState(0);
  const [arenoso, setArenoso] = useState(0);

  const locationFilterDictionary = [
    {
      location: 'Club Amigos Leales',
      setState: setClubAmigosLeales,
    },
    {
      location: 'Estadio Olimpico',
      setState: setEstadioOlimpico,
    },
    {
      location: 'La Loteria',
      setState: setLaLoteria,
    },
    {
      location: 'Arenoso',
      setState: setArenoso,
    },
  ];

  // Función para obtener los clientes de la base de datos
  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clients').select('*')

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Calcular upToDatePay para cada cliente
      const updatedClients = data.map((client) => {
        const lastPaymentDate = new Date(client.last_payment);
        const lastPaymentMonth = lastPaymentDate.getMonth();
        const lastPaymentYear = lastPaymentDate.getFullYear();
        const payDay = parseInt(client.pay_day, 10);

        let upToDatePay = false;

        if (
          (lastPaymentYear === currentYear && lastPaymentMonth === currentMonth) || // Pago este mes
          (lastPaymentYear === currentYear &&
            lastPaymentMonth === currentMonth - 1 &&
            currentDate.getDate() < payDay) || // Pago el mes pasado y aún no llega el día de pago de este mes
          (lastPaymentYear === currentYear - 1 &&
            lastPaymentMonth === 11 &&
            currentMonth === 0 &&
            currentDate.getDate() < payDay) // Pago en diciembre y aún no llega el día de pago de enero
        ) {
          upToDatePay = true;
        }

        return {
          ...client,
          upToDatePay,
        };
      });

      // Total de clientes
      setTotalClientes(data.length);

      // Calcular cuántos clientes están pagos y cuántos pendientes
      const pagos = updatedClients.filter((client) => client.upToDatePay);
      const pendientes = data.length - pagos.length;

      setClientesPagos(pagos.length);
      setClientesPendientes(pendientes > 0 ? pendientes : 0);
    }
  };

  // Función para filtrar clientes por sucursal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterClientsByLocation = async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const location of locationFilterDictionary) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('location', location.location);

      if (error) {
        console.error(error);
      } else {
        location.setState(data.length);
      }
    }
  };

  useEffect(() => {
    fetchClientes();
    filterClientsByLocation();
  }, [filterClientsByLocation]);

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

      <Typography variant="h4" sx={{ mb: 2 }}>
        Sucursales:
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <Link to="/club-amigos-leales" style={{ textDecoration: 'none' }}>
            <AppWidgetSummary
              title="Club Amigos Leales"
              total={clubAmigosLeales}
              color="success"
              icon={<img alt="icon" src="/assets/icons/pesa.png" />}
            />
          </Link>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Link to="/estadio-olimpico" style={{ textDecoration: 'none' }}>
            <AppWidgetSummary
              title="Estadio Olimpico"
              total={estadioOlimpico}
              color="warning"
              icon={<img alt="icon" src="/assets/icons/pesa.png" />}
            />
          </Link>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Link to="/la-loteria" style={{ textDecoration: 'none' }}>
            <AppWidgetSummary
              title="La Loteria"
              total={laLoteria}
              color="error"
              icon={<img alt="icon" src="/assets/icons/pesa.png" />}
            />
          </Link>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Link to="/arenoso" style={{ textDecoration: 'none' }}>
            <AppWidgetSummary
              title="Arenoso"
              total={arenoso}
              color="error"
              icon={<img alt="icon" src="/assets/icons/pesa.png" />}
            />
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}
