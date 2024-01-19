import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupingOption, setGroupingOption] = useState('status');
  const [sortOption, setSortOption] = useState('priority');

  useEffect(() => {
    // Load saved grouping and sorting options from localStorage
    const groupingOption = localStorage.getItem('groupingOption');
    const sortOption = localStorage.getItem('sortOption');

    console.log('Saved Grouping Option:', groupingOption);
    console.log('Saved Sort Option:', sortOption);

    if (groupingOption !== null) {
      setGroupingOption(groupingOption);
    }

    if (sortOption !== null) {
      setSortOption(sortOption);
    }

    // Fetch data from the API and update state
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        setTickets(data.tickets);
        setUsers(data.users);
        setLoading(false);
      })
      .catch(error => {
        console.error('API Error:', error);
        setError('Error fetching data from the API');
        setLoading(false);
      });
  }, []); // Run only on the initial render

  useEffect(() => {
    // Save grouping and sorting options to localStorage
    localStorage.setItem('groupingOption', groupingOption);
    localStorage.setItem('sortOption', sortOption);
  }, [groupingOption, sortOption]);


  const getPriorityLabel = priority => {
    switch (priority) {
      case 4:
        return 'Urgent';
      case 3:
        return 'High';
      case 2:
        return 'Medium';
      case 1:
        return 'Low';
      case 0:
        return 'No priority';
      default:
        return 'Unknown Priority';
    }
  };
  

  const groupTickets = () => {
    switch (groupingOption) {
      case 'status':
        return tickets.reduce((grouped, ticket) => {
          const status = ticket.status;
          if (!grouped[status]) {
            grouped[status] = [];
          }
          grouped[status].push(ticket);
          return grouped;
        }, {});
      case 'user':
        return tickets.reduce((grouped, ticket) => {
          const userId = ticket.userId;
          if (!grouped[userId]) {
            grouped[userId] = [];
          }
          grouped[userId].push(ticket);
          return grouped;
        }, {});
      case 'priority':
        return tickets.reduce((grouped, ticket) => {
          const priority = ticket.priority;
          if (!grouped[priority]) {
            grouped[priority] = [];
          }
          grouped[priority].push(ticket);
          return grouped;
        }, {});
      default:
        return {};
    }
  };

  const sortTickets = groupedTickets => {
    switch (sortOption) {
      case 'priority':
        return Object.keys(groupedTickets)
          .sort((a, b) => b - a)
          .map(key => groupedTickets[key])
          .flat();
      case 'title':
        return tickets.slice().sort((a, b) => a.title.localeCompare(b.title));
      default:
        return tickets.slice();
    }
  };

  const handleDisplayClick = () => {
    // Additional logic for displaying based on user's selections
    // This could involve further API requests or local data processing
  };

  

  const renderTickets = () => {
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    const groupedTickets = groupTickets();
    const sortedTickets = sortTickets(groupedTickets);
  
    // Create an object to hold tickets for each group
    const groupedColumns = {};
  
    sortedTickets.forEach(ticket => {
      const groupValue = getGroupValue(ticket, groupingOption);
      
      if (!groupedColumns[groupValue]) {
        groupedColumns[groupValue] = [];
      }
  
      groupedColumns[groupValue].push(ticket);
    });
  
    // Render columns for each group
    const columns = Object.keys(groupedColumns).map(groupValue => (
      <div key={groupValue} className="column">
        <h2>{getGroupLabel(groupValue, groupingOption)}</h2>
        {groupedColumns[groupValue].map(ticket => (
          <div key={ticket.id} className="ticket">
            <h3>{ticket.title}</h3>
            <p>Task ID: {ticket.id}</p>
            <p>User: {getUserById(ticket.userId)?.name}</p>
            <p>Priority: {getPriorityLabel(ticket.priority)}</p>
            {/* Add other ticket details as needed */}
          </div>
        ))}
      </div>
    ));
  
    return <div className="columns">{columns}</div>;
  };
  
  // Helper function to get the value for grouping
  const getGroupValue = (ticket, groupingOption) => {
    switch (groupingOption) {
      case 'status':
        return ticket.status;
      case 'user':
        return ticket.userId;
      case 'priority':
        return ticket.priority;
      default:
        return null;
    }
  };
  
  // Helper function to get the label for grouping
  const getGroupLabel = (groupValue, groupingOption) => {
    switch (groupingOption) {
      case 'status':
        return `${groupValue}`;
      case 'user':
        const user = getUserById(groupValue);
        return user ? `${user.name}` : 'Unassigned';
      case 'priority':
        return getPriorityLabel(parseInt(groupValue)); // Parse the groupValue to an integer
      default:
        return null;
    }
  };
  

  const getUserById = userId => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="kanban-board">
      <div className="controls">
        <button onClick={handleDisplayClick}>Display</button>
        <select onChange={e => {
          console.log('Grouping Option Changed:', e.target.value);
          setGroupingOption(e.target.value);
        }} value={groupingOption}>
          <option value="status">By Status</option>
          <option value="user">By User</option>
          <option value="priority">By Priority</option>
        </select>
        <select onChange={e => {
          console.log('Sort Option Changed:', e.target.value);
          setSortOption(e.target.value);
        }} value={sortOption}>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      <div className="tickets">{renderTickets()}</div>
    </div>
  );
};

export default App;