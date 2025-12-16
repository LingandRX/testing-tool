import { Link } from 'react-router-dom';

const ActionsPage = () => {
  return (
    <div className="page">
      <h1>Actions Page</h1>
      <p>Perform user actions here (e.g., add, edit, delete).</p>

      <div className="actions">
        <button className="action-btn">Add User</button>
        <button className="action-btn">Bulk Delete</button>
      </div>

      {/* Link back to UserListPage */}
      <Link to="/" className="btn">
        Back to User List
      </Link>

      <Link to="/timestamp" className="btn">
        Go to Timestamp
      </Link>
    </div>
  );
};

export default ActionsPage;
