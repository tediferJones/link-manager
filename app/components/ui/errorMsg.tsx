// FIX ME consider renaming to just Error
// rename associated file in @/effects too
//
// FIX ME is this component really needed?
//  - only gets used in forms (editItem and decryptPrompt)
//  - could just use custom validation messages instead
export default function ErrorMsg({ id }: { id: string }) {
  return (
    <div className='text-red-500 font-semibold m-auto hidden col-span-full'
      id={`error-${id}`}
    ></div>
  )
}
