import { useState } from 'react'
import './App.css';
import { useQuery, gql } from '@apollo/client';

const query = gql`
    query q {
      getTodos {
        title
        completed
        user {
          name, email, phone
        }
    }
}`;

function App() {

  const { data, loading, error } = useQuery(query);

  if(loading) return <h1>Loading..</h1>

  return (
    <>
    {JSON.stringify(data)}
      </>
        
     
  );
  }

export default App
