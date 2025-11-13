import ghost from '@/assets/icon/ghost.svg'

interface ContentProps {
  title: string
  description: string
}

const Content = ({ title, description }: ContentProps) => {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-10">
      <img src={ghost} alt="No movies available yet" />
      <div className="flex flex-col gap-1">
        <span className="font-family-inter m-auto text-xl font-medium text-gray-300">{title}</span>
        <span className="font-family-inter font-normal text-gray-100">{description}</span>
      </div>
    </section>
  )
}

export default Content
