// FIX ME consider renaming to just Error
// rename associated file in @/effects too
export default function ErrorMsg({ id }: { id: string }) {
  return (
    <div className='text-red-500 font-semibold m-auto hidden col-span-full'
      id={`error-${id}`}
    ></div>
  )
}
