import ytsub from '../assets/ytsub.svg'

export const Navbar = () => {
  return (
    <div className="h-16 py-2 px-4 gap-2 shadow-sm shadow-primary flex items-center">
      <img className="h-full" src={ytsub} />
      <h1 className="font-bold italic text-2xl">
        YT&nbsp;
        <span className="text-primary">Subtitle</span>
      </h1>
    </div>
  )
}
