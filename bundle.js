/**
* Reducers
* - an action describes the fact that something happened, but does not specify how
* - a reducer specifies how the application state changes and makes the changes to the state object
*/

/**
 * @name todo
 * @desc Reducer for a single todo item.  Called by the @name todos reducer.
 * @param {object} state - The state of the todo item
 * @param {object} action - User action performed on the todo item and state changes
 * @returns {object} state - Application state after modifications 
 */
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

/**
 * @name todos
 * @desc Reducer for the array of todo items
 * @param {array} state - The state of the todo list component (array of objects)
 * @param {object} action - User action performed on the todo item and state changes
 * @returns {object} state - Application state after modifications
 */
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        // will return the state plus a new todo item object
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      // creates a new array with the result of calling a function for every element
      // in other words, array.map iterates over the array passing each object to the 
      // @name todo reducer the original array is left unchanged unless 
      // acted on by the @name todo reducer
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

/**
 * @name visibilityFilter
 * @desc Reducer for the todo visibility filters
 * @param {string} state - Defaults to showing all items.
 * @param {object} action - User action performed on the filter and state changes
 * @returns {object} state - Application state after modifications
 */
const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter; // look into why this returns action.filter?
    default:
      return state;
  }
};

/**
 * @name combineReducers
 * @desc The combineReducers helper function turns an object whose values are different 
         reducing functions into a single reducing function you can pass to createStore.
 * @arg {object} - Object of reducers to be combinned
 * @memberOf Redux
 */
const {combineReducers} = Redux;
const todoApp = combineReducers({
  todos,
  visibilityFilter
});

/**
 * @name addTodo
 * @desc Creates an action to be used by the dispatcher
 * @param {string} text - The text for the todo item
 * @returns {object} action 
 */
let nextTodoId = 0;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

/**
 * @name toggleTodo
 * @desc Creates an action to be used by the dispatcher
 * @param {string} id - the id of the todo item that has being toggled
 * @returns {object} action 
 */
const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};

/**
 * @name setVisibilityFilter
 * @desc Creates an action to be used by the dispatcher
 * @param {string} filter - the string value of the filter selected by the user
 * @returns {object} action 
 */
const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};

// require React Component class for creating UI components
const {Component} = React;
// the provider component will use the react advanced context feature to make the store available to any component inside it, including grand-children
// https://egghead.io/lessons/javascript-redux-passing-the-store-down-implicitly-via-context?course=getting-started-with-redux
const {Provider, connect} = ReactRedux;

// link component
const Link = ({active, children, onClick}) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a href='#' onClick={e => {
                       e.preventDefault();
                       onClick();
                     }}>
      {children}
    </a>
    );
};

// todo: what this do
const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};
// todo: what this do
const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter));
    }
  };
}
// todo: what this do
const FilterLink = connect(mapStateToLinkProps, mapDispatchToLinkProps)(Link);

// footer component
const Footer = () => (
<p>
  Show:
  {' '}
  <FilterLink filter='SHOW_ALL'>
    All
  </FilterLink>
  {', '}
  <FilterLink filter='SHOW_ACTIVE'>
    Active
  </FilterLink>
  {', '}
  <FilterLink filter='SHOW_COMPLETED'>
    Completed
  </FilterLink>
</p>
);

const Todo = ({onClick, completed, text}) => (
<li onClick={onClick} style={{ textDecoration: completed ? 'line-through' : 'none' }} className={completed ?
                                                                                                 'completed' :
                                                                                                 ''}>
  {text}
</li>
);

const TodoList = ({todos, onTodoClick}) => (
<ul>
  {todos.map(todo => <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
   )}
</ul>
);

let AddTodo = ({dispatch}) => {
  let input;

  return (
    <div>
      <input ref={node => {
                    input = node;
                  }} />
      <button onClick={() => {
                         dispatch(addTodo(input.value));
                         input.value = '';
                       }}>
        Add Todo
      </button>
    </div>
    );
};
AddTodo = connect()(AddTodo);

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      );
  }
}

const mapStateToTodoListProps = (
  state
) => {
  return {
    todos: getVisibleTodos(
      state.todos,
      state.visibilityFilter
    )
  };
};
const mapDispatchToTodoListProps = (
  dispatch
) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id));
    }
  };
};
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

const TodoApp = () => (
<div>
  <AddTodo />
  <VisibleTodoList />
  <Footer />
</div>
);

const {createStore} = Redux;

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);
