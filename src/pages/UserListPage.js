import { Link } from 'react-router-dom';

const UserListPage = () => {
  // Sample user data (replace with API calls later)
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  return (
    <div className="page">
      <h1>User List</h1>
      <p>Click "Actions" to manage users.</p>

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> ({user.email})
          </li>
        ))}
      </ul>

      {/* Link to ActionsPage */}
      <Link to="/actions" className="btn">
        Go to Actions Page
      </Link>
    </div>
  );
};

export default UserListPage;
