import {
  Button,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../components/common/PageHeader';
import { useApp } from '../../context/AppContext';
import { inventoryStats, profitStats, margin } from '../../utils/calculations';
import { csvDownload, money } from '../../utils/formatters';

export default function Reports() {
  const {
    cars,
    suppliers,
    customers,
    applications,
    activity,
  } = useApp();

  const inventory = inventoryStats(cars);
  const profit = profitStats(cars);

  const exportRows = cars.map((car) => ({
    id: car.id,
    vehicle: `${car.make} ${car.model}`,
    purchase: car.purchaseRate,
    selling: car.sellingPrice,
    profit: Number(car.sellingPrice || 0) - Number(car.purchaseRate || 0),
    margin: margin(car.sellingPrice, car.purchaseRate).toFixed(2),
    stock: car.stock,
    status: car.status,
  }));

  const handleExport = () => {
    csvDownload(exportRows, 'car-profit-report.csv');
  };

  const cards = [
    ['Inventory Total', inventory.total],
    ['Available', inventory.available],
    ['Reserved', inventory.reserved],
    ['Sold', inventory.sold],
    ['Suppliers', suppliers.length],
    ['Customers', customers.length],
    [
      'Pending Applications',
      applications.filter((application) => application.status === 'PENDING').length,
    ],
    ['Gross Profit', money(profit.profit)],
  ];

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Dynamic inventory, profit, supplier, application, customer and activity reports"
        action={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map(([label, value]) => (
          <Grid item xs={6} sm={4} md={3} key={label}>
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">{label}</Typography>
              <Typography variant="h5" fontWeight={800}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, overflow: 'auto' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={800}>
                Profit by Vehicle
              </Typography>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Purchase</TableCell>
                  <TableCell>Selling</TableCell>
                  <TableCell>Profit</TableCell>
                  <TableCell>Margin</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cars.map((car) => {
                  const carProfit =
                    Number(car.sellingPrice || 0) - Number(car.purchaseRate || 0);
                  const carMargin = margin(car.sellingPrice, car.purchaseRate);

                  return (
                    <TableRow key={car.id}>
                      <TableCell>
                        {car.make} {car.model}
                      </TableCell>
                      <TableCell>{money(car.purchaseRate)}</TableCell>
                      <TableCell>{money(car.sellingPrice)}</TableCell>
                      <TableCell>{money(carProfit)}</TableCell>
                      <TableCell>{carMargin.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Activity Audit Log
            </Typography>

            {activity.slice(0, 12).map((item) => (
              <Typography variant="body2" key={item.id} sx={{ py: 0.6 }}>
                <b>{item.action}</b> {item.entity} — {item.details}
              </Typography>
            ))}

            {!activity.length && (
              <Typography color="text.secondary">
                No activity recorded yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
