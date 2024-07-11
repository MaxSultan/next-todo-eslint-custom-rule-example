import { useId, useState } from "react";
import { styled } from "styled-components";
import { DestructiveActionButton } from "../components/destructive-action-button";

const AddButton = styled.button`
  background-color: green;
`;

const TodoList = styled.ul`
  list-style: none;
`;

// const CancelButton = styled(({ onCancel, children, className }) => (
//   <button type="button" onClick={onCancel} className={className}>
//     {children}
//   </button>
// ))``;

const CancelButton = ({ onCancel, children }) => (
  <button type="button" onClick={onCancel}>
    {children}
  </button>
);

const FormCard = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: baseline;
  border-bottom: 3px solid grey;

  & > ${CancelButton} {
    border: 5px solid red;
  }
`;

const TodoForm = ({
  setTodos,
  onCancel,
  onSubmit,
  existingName,
  existingDescription,
  id,
}) => {
  const [name, setName] = useState(id ? existingName : "");
  const [description, setDescription] = useState(id ? existingDescription : "");
  const tempId = useId();
  const nonNullId = id ? id : tempId;

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = (e) => {
    const newTodo = {
      name,
      description,
      id: nonNullId,
    };
    e.preventDefault();
    if (id) {
      setTodos((prevTodos) => [
        ...prevTodos.filter((todo) => todo.id !== id),
        newTodo,
      ]);
    } else {
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    }

    onSubmit();
    resetForm();
  };

  return (
    <li>
      <FormCard action="" onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="description">Description:</label>
          <input
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </fieldset>
        <button type="submit">
          {existingName || existingDescription ? "Update" : "Create"}
        </button>
        <CancelButton onCancel={() => onCancel()}>Cancel</CancelButton>
      </FormCard>
    </li>
  );
};

const DeleteButton = styled(DestructiveActionButton)`
  & > button {
    background-color: red;
    color: white;
  }
`;

const TodoCard = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: baseline;
  border-bottom: 3px solid grey;
`;

const Todo = ({ name, description, setTodos, id }) => {
  const [editing, setEditing] = useState(false);
  const handleDelete = () =>
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

  const enableEditMode = () => {
    setEditing(true);
  };

  return editing ? (
    <TodoForm
      onCancel={() => setEditing(false)}
      existingName={name}
      existingDescription={description}
      onSubmit={() => setEditing(false)}
      setTodos={setTodos}
      id={id}
    />
  ) : (
    <li key={id}>
      <TodoCard>
        <h2>{name}</h2>
        <p>{description}</p>
        <DeleteButton onDelete={handleDelete}>Delete</DeleteButton>
        <button onClick={enableEditMode}>Edit</button>
      </TodoCard>
    </li>
  );
};

const Home = () => {
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todos, setTodos] = useState([
    { name: "Laundry", description: "Your clothes are all dirty", id: 1 },
  ]);

  const appendTodoForm = () => {
    setShowTodoForm(true);
  };

  return (
    <main>
      <h1>TODOs</h1>
      <AddButton onClick={appendTodoForm}>Add a Todo</AddButton>
      <TodoList>
        {todos.map(({ name, description, id }) => (
          <Todo
            name={name}
            description={description}
            setTodos={setTodos}
            id={id}
            key={id}
          />
        ))}
        {showTodoForm && (
          <TodoForm
            setShowTodoForm={setShowTodoForm}
            setTodos={setTodos}
            onCancel={() => setShowTodoForm(false)}
            onSubmit={() => setShowTodoForm(false)}
          />
        )}
      </TodoList>
    </main>
  );
};

export default Home;
