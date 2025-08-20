export function PageLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="absolute h-[16rem] w-[16rem] animate-ping rounded-full border-red-500 border-t-4 border-b-4"></div>
      <div className="absolute h-[14rem] w-[14rem] animate-spin rounded-full border-purple-500 border-t-4 border-b-4"></div>
      <div className="absolute h-[12rem] w-[12rem] animate-ping rounded-full border-pink-500 border-t-4 border-b-4"></div>
      <div className="absolute h-[10rem] w-[10rem] animate-spin rounded-full border-yellow-500 border-t-4 border-b-4"></div>
      <div className="absolute h-[8rem] w-[8rem] animate-ping rounded-full border-green-500 border-t-4 border-b-4"></div>
      <div className="absolute h-[6rem] w-[6rem] animate-spin rounded-full border-blue-500 border-t-4 border-b-4"></div>
      <div className="flex h-28 w-28 animate-bounce items-center justify-center rounded-full font-semibold text-gray-400 text-xl dark:text-black">
        Loading...
      </div>
    </div>
  )
}
