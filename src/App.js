import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

const TODO_QUERY = gql`
    query getTodos {
        todos {
            id,
            text,
            done
        }
    }
`;

const ADD_TODO = gql`
    mutation addTodo($text: String!) {
        insert_todos(objects: {text: $text}) {
            returning {
                id
                text
                done
            }
        }
    }
`;

const TOGGLE_TODO = gql`
    mutation toggleTodo($id: uuid!, $done: Boolean!) {
        update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
            returning {
                id
                text
                done
            }
        }
    }
`;

const DELETE_TODO = gql`
    mutation deleteTodo($id: uuid!) {
        delete_todos(where: {id: {_eq: $id}}) {
            returning {
                id
                text
                done
            }
        }
    }
`;

function App() {
    const { loading, error, data } = useQuery(TODO_QUERY);
    const [toggleTodo] = useMutation(TOGGLE_TODO);
    const [deleteTodo] = useMutation(DELETE_TODO);
    const [addTodo] = useMutation(ADD_TODO, {
        onCompleted: () => setTodoInput('')
    });
    const [todoInput, setTodoInput] = useState('');

    const handleToggle = async ({ id, done }) => {
        await toggleTodo({
            variables: {
                id,
                done: !done
            }
        });
    }

    const addTodoHandler = async (e) => {
        e.preventDefault();
        if (todoInput.trim()) {
            await addTodo({
                variables: {
                    text: todoInput.trim()
                },
                refetchQueries: [{ query: TODO_QUERY }]
            });
        } else {
            return;
        }
    }

    const deleteTodoHandler = async (id) => {
        await deleteTodo({
            variables: { id },
            refetchQueries: [{ query: TODO_QUERY }]
        })
    }

    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="vh-100 code flex flex-column items-center
        bg-purple white pa3 fl-1" >
            <h1 className='f2-l'>
                GraphQL Todo App<span className='green ml3' role='img' aria-label='Checkmark'>
                    ✔️
                </span>
            </h1>
            <form className='mb3' onSubmit={addTodoHandler}>
                <input
                    type='text'
                    className='pa2 f4 b--dashed'
                    placeholder='Write your todo'
                    value={todoInput}
                    onChange={e => setTodoInput(e.target.value)}
                />
                <button className='pa2 f4 bg-green' style={{ cursor: 'pointer' }}>Create</button>
            </form>
            <div className='flex items-center justify-center 
                flex-column'>
                {data.todos.length > 0 && data.todos.map(todo => (
                    <div style={{ userSelect: 'none' }}
                        className={`ma3 ${todo.done && 'strike'}`} key={todo.id}
                        onDoubleClick={() => handleToggle(todo)}
                    >
                        <span className='pointer list pa1 f3'>{todo.text}</span>
                        <button className='bg-transparent 
                            bn f4' onClick={() => deleteTodoHandler(todo.id)}><span className='red f3'>&times;</span></button>
                    </div>
                ))}
                {data.todos.length <= 0 && (
                    <p className='f3'>No todos</p>
                )}
            </div>
        </div>
    );
}

export default App;
