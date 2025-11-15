interface HeaderProps {
  title: string
  buttonText: string
  onClick?: () => void
}

const Header = ({ title, buttonText, onClick = () => {} }: HeaderProps) => {
  return (
    <section className="flex items-center justify-between p-6">
      <span className="header-2 text-gray-700">{title}</span>
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
export default Header
