import { useParams } from 'react-router-dom';

const UserDetail = () => {
  const { id } = useParams();  // Access the id from the route parameter
  
  return (
    <div>
      <h4>User Detail for ID: {id}</h4>
      {/* Fetch and display user details here */}
    </div>
  );
};

export default UserDetail;