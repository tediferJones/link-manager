import NestedTsxTest from './nestedTsxTest';

export default function HelloWorld() {
  return (
    <div class='bg-yellow-500 max-w-[720px] min-w-[360px] flex flex-col gap-4 justify-center items-center'>
      Hello World
      <NestedTsxTest />
    </div>
  )
}
