import { AppShell } from '../components/templates/AppShell/AppShell';
import { UserList } from '../components/organisms/UserList/UserList';
import { getUsers, type User } from '../queries/users';

export async function loader() {
  const users = await getUsers();
  return { users };
}

type ProfilePageProps = {
  loaderData: { users: User[] };
};

export default function ProfilePage({ loaderData }: ProfilePageProps) {
  return (
    <AppShell>
      <UserList users={loaderData.users} />
    </AppShell>
  );
}
