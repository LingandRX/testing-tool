const TodoList = ({todoContentList = []}) => {
  
  const todoLi = todoContentList?.map((todo, index) => {
    return (
      <li key={index}>{todo}</li>
    )
  })
  
  return (
    <div className="todo-list">
      <ul>
        {todoLi}
      </ul>
    </div>
  );
};

export default TodoList;