import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    const sub = client.models.Todo
      .observeQuery({ authMode: "userPool" })
      .subscribe({
        next: ({ items }) => setTodos([...items]),
        error: (err) => console.error("observeQuery error:", err),
      });
    return () => sub.unsubscribe();
  }, []);

  async function createTodo() {
    const content = window.prompt("Todo content");
    if (!content || !content.trim()) return;
    await client.models.Todo.create({ content }, { authMode: "userPool" });
  }

  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id }, { authMode: "userPool" });
  }

  return (
    <main style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>

      <button onClick={createTodo}>+ new</button>

      {/* Rows instead of <ul>/<li> to avoid external list CSS overriding the button */}
      <div style={{ marginTop: 12 }}>
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
              marginTop: 8,
              background: "white",
            }}
          >
            <span>{todo.content}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete ${todo.content}`}
              title="Delete"
              style={{ fontSize: "0.85rem", padding: "4px 10px" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>

      <button onClick={signOut} style={{ marginTop: 12 }}>
        Sign out
      </button>
    </main>
  );
}

export default App;
