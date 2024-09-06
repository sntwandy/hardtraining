import { Helmet } from 'react-helmet-async';

import { UserView } from 'src/sections/user/view';

import { supabase } from '../lib/supabase.ts';

// ----------------------------------------------------------------------

export async function getServerSideProps({ req }) {
  // Recupera la sesión directamente desde las cookies del usuario
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Si hay sesión, pasa los datos a la página
  return {
    props: {
      user: session.user, // puedes enviar los datos del usuario si los necesitas
    },
  };
}

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> User | Hard Training </title>
      </Helmet>

      <UserView />
    </>
  );
}
