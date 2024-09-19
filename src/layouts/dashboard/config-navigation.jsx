import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'club amigos leales',
    path: '/club-amigos-leales',
    icon: icon('ic_user'),
  },
  {
    title: 'estadio olimpico',
    path: '/estadio-olimpico',
    icon: icon('ic_user'),
  },
  {
    title: 'la loteria',
    path: '/la-loteria',
    icon: icon('ic_user'),
  },
  {
    title: 'arenoso',
    path: '/arenoso',
    icon: icon('ic_user'),
  },
];

export default navConfig;
