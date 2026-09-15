import type { User } from '../../../queries/users';
import styles from './UserList.module.css';

type UserListProps = {
  users: User[];
};

function userDisplayName(user: User) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.emailAddress;
}

export function UserList({ users }: UserListProps) {
  return (
    <section className={styles.root}>
      <h1 className={styles.title}>Profile</h1>
      {users.length === 0 ? (
        <p className={styles.empty}>No users yet.</p>
      ) : (
        <ul className={styles.list}>
          {users.map((user) => (
            <li key={user.userId} className={styles.item}>
              {userDisplayName(user)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
