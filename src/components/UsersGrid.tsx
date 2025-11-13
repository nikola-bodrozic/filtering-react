interface RowData {
  name: string;
  profile: {
    city: string;
    profession: string;
  };
}

interface UsersGridProps {
  data: RowData[];
  onEdit: (item: RowData, index: number) => void;
}

const UsersGrid = ({ data, onEdit }: UsersGridProps) => {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th className='headerStyle'>Name</th>
            <th className='headerStyle'>City</th>
            <th className='headerStyle'>Profession</th>
            <th className='headerStyle'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => (
            <tr key={index} className='rowStyle'>
              <td className='cellStyle'>{user.name}</td>
              <td className='cellStyle'>{user.profile.city}</td>
              <td className='cellStyle'>{user.profile.profession}</td>
              <td className='cellStyle'>
                {/* Edit button passes params to parent */}
                <button onClick={() => onEdit(user, index)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersGrid;