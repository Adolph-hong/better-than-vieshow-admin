/* eslint-disable react/require-default-props */
interface MovieHeaderProps {
  title: string
  buttonText: string
  onClick?: () => void
}

const MovieHeader = ({ title, buttonText, onClick = () => {} }: MovieHeaderProps) => {
  return (
    <section className="flex items-center justify-between p-6">
      <span className="header-2 leading-[100%] text-gray-700">{title}</span>
      <button
        type="button"
        className="bg-primary-500 body-medium flex cursor-pointer rounded-[10px] px-4 py-2.5 text-white"
        onClick={onClick}
      >
        {buttonText}
      </button>
    </section>
  )
}
export default MovieHeader
