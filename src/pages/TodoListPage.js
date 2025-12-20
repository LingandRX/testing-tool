import TodoMarkdownEditor from "../components/TodoMarkdownEditor";
import TodoList from "../components/TodoList";


function TodoListPage() {
  return (<div>
    <TodoMarkdownEditor/>
    <TodoList todoContentList={['1. 创建待办事项列表', '2. 添加新的待办事项', '3. 删除已完成的待办事项']}/>
  </div>)
}

export default TodoListPage;