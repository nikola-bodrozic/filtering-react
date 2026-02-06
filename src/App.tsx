import { memo, useState, useEffect, type FormEvent } from "react";
import { cloneDeep, isEqual } from "lodash";
import { FruitsProvider } from "./context/FruitsProvider";
import PlainPie from "./components/PlainPie";
import Filter from "./components/Filter";
import "./App.css";
import { sales2024 } from "./components/values";
import AdvancedFilter from "./components/AdvancedFilter";
import MultiFilter from "./components/MultiFilter";
import TwoInputFields from "./components/TwoInputFields";
import { UserProvider } from "./context/UserProvider";
import { UserForm } from "./components/UserForm";
import { UserList } from "./components/UserList";
import UsersGrid from "./components/UsersGrid";
// import FilterMap from "./components/FilterMap";
import { type User } from "./components/values";
import ProductCard from "./components/ProductCard";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepCompare = (prevProps: any, nextProps: any) => {
  return isEqual(prevProps, nextProps);
};

export default function App() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Alice', profile: { city: 'Paris', profession: 'Engineer' } },
    { id: 2, name: 'Bob', profile: { city: 'London', profession: 'Designer' } },
    { id: 3, name: 'Charlie', profile: { city: 'New York', profession: 'Teacher' } },
    { id: 4, name: 'Diana', profile: { city: 'Tokyo', profession: 'Developer' } },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    profession: ''
  });

  const MemoPie = memo(PlainPie, deepCompare);

  const handleEdit = (user: User, id: number) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      city: user.profile.city,
      profession: user.profile.profession
    });
    setShowOverlay(true);
    console.log(user, id);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setEditingUser(null);
    setFormData({ name: '', city: '', profession: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Log form values
    console.log('Form submitted with values:', formData);
    console.log('Editing user ID:', editingUser?.id);
    
    if (!editingUser) return;

    // Update the user
    const clonedUsers = cloneDeep(users);
    const found = clonedUsers.find((user: User) => user.id === editingUser.id);
    if (found) {
      found.name = formData.name;
      found.profile.city = formData.city;
      found.profile.profession = formData.profession;
    }
    setUsers(clonedUsers);
    
    // Show confirmation alert
    alert(`User updated:
Name: ${formData.name}
City: ${formData.city}
Profession: ${formData.profession}`);
    
    handleCloseOverlay();
  };

  useEffect(() => {
    // Create AbortController
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://test.nikolabodr.com/get.php",
          {
            signal: controller.signal,
          },
        );
        setData(response.data[0]);
      } catch (error) {
        if (axios.isCancel(error)) {
          if (error.message) console.log("Request canceled:", error.message);
        } else {
          console.error("API Error:", error);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      {/* Transparent grey overlay with form */}
      {showOverlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(128, 128, 128, 0.5)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Form container */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}>
            <h3>Edit User (ID: {editingUser?.id})</h3>
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  City:
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Profession:
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  Save Changes
                </button>
                
                <button
                  type="button"
                  onClick={handleCloseOverlay}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* pass array and function as prop */}
      <UsersGrid data={users} onEdit={handleEdit} />

      <FruitsProvider>
        {/* pass array as prop */}
        <MemoPie data={sales2024} title="Car Sales by Manufacturer" />
        <hr />
        <Filter />
      </FruitsProvider>
      {/* <FilterMap /> */}
      <hr />
      <AdvancedFilter />
      <hr />
      <MultiFilter />
      <hr />
      <TwoInputFields />
      {data ? (
        <ProductCard
          title={data.name}
          description={data.description}
          price={{
            unit_amount: data.prices[0].unit_amount / 100,
            currency: data.prices[0].currency.toUpperCase() as string,
          }}
        />
      ) : (
        <p>{"Loading..."}</p>
      )}
      <hr />
      <UserProvider>
        <div style={{ border: "3px dotted black", padding: "1em" }}>
          <h2>Context + Reducer: Array of Objects Example</h2>
          <UserForm />
          <UserList />
        </div>
      </UserProvider>
    </div>
  );
}