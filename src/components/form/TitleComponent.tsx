const TitleComponent = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="flex flex-col gap-[5px]">
      <h1 className="body-large text-gray-900">{title}</h1>
      <span className="body-medium text-gray-300">{description}</span>
    </div>
  )
}

export default TitleComponent
