export default function App() {
  return (
    <div className='p-4 flex flex-col gap-4 min-w-[360px] max-w-[720px]'>
      <h1 className='text-center text-2xl font-bold text-blue-500'>
        LINK MANAGER
      </h1>
      <form className='flex gap-4'>
        <button className='text-xl defaultBorder'
          title='Go to parent directory'
        >⬆️</button>
        <input className='flex-1 text-lg defaultBorder w-[1px]' placeholder='Title' />
        <button className='text-xl defaultBorder'
          title='Add link'
        >➕</button>
        <button className='text-xl defaultBorder'
          title='Create folder'
        >📁</button>
      </form>
      <div className='defaultBorder'></div>
    </div>
  )
}
