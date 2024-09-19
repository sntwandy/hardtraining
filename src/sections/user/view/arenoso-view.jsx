import React, { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Modal,
  Stack,
  Table,
  Button,
  Select,
  useTheme,
  MenuItem,
  TextField,
  Container,
  TableBody,
  Typography,
  InputLabel,
  FormControl,
  useMediaQuery,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { supabase } from 'src/lib/supabase.ts';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function UserPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMdUp ? 800 : 300, // Adjust width based on breakpoint
    bgcolor: 'background.paper',
    borderRadius: 1.5,
    p: isMdUp ? 6 : 2, // Adjust padding based on breakpoint
  };

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openModal, setOpenModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    birthday: '',
    weight: '',
    phone_number: '',
    pay_day: '',
  });

  // Function to fetch clients from Supabase based on the location 'Club Amigos Leales'
  const getClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('location', 'Arenoso'); // Filter by location

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

      setClients(updatedClients);
    }
  };

  // Fetch clients when the component mounts
  useEffect(() => {
    getClients();
  }, []);

  // Function to refresh clients list after update
  const refreshClients = async () => {
    await getClients();
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = clients.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Obtener la fecha actual
    const currentDate = new Date();

    // Crear una nueva fecha para last_payment usando el pay_day del formulario
    const lastPaymentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      formData.pay_day
    );

    // Añadir last_payment a los datos del formulario
    const dataToInsert = {
      ...formData,
      last_payment: lastPaymentDate,
    };

    // Guardar los datos en Supabase
    const { error } = await supabase.from('clients').insert([dataToInsert]);
    if (error) {
      console.error('Error inserting client:', error);
    } else {
      console.log('Client inserted successfully');
      setOpenModal(false);
      getClients(); // Refresh the client list after adding a new one
    }
  };

  const dataFiltered = applyFilter({
    inputData: clients,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="subtitle2" mb={4}>
          Clientes: <Typography variant="h5">Arenoso</Typography>
        </Typography>

        <Button
          onClick={() => setOpenModal(true)}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Registrar Cliente
        </Button>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" mb={3}>
              Formulario de Registro de Cliente en sucursal: Arenoso
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre(s) y Apellido(s)"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      label="Sucursal"
                    >
                      <MenuItem value="Arenoso">Arenoso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Peso (Lbs)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone_number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Día de Pago"
                    name="pay_day"
                    type="string"
                    value={formData.pay_day}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth type="submit" variant="contained" color="primary">
                    Registrar
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Modal>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={clients.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Nombre' },
                  { id: 'location', label: 'Sucursal' },
                  { id: 'upToDate', label: 'Pago al dia', align: 'center' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      userId={row.id}
                      phoneNumber={row.phone_number}
                      name={row.name}
                      status={row.status}
                      location={row.location}
                      avatarUrl={row.avatarUrl}
                      upToDatePay={row.upToDatePay} // Pasar upToDatePay calculado
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                      refreshClients={refreshClients} // Pass refresh function to child component
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, clients.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
