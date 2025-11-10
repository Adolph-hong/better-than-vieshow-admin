const Sidebar = () => {
  return (
    <div className="min-h-screen w-60 bg-white py-6">
      {/* 上方logo與主題文字 */}
      <section className="mb-11 flex justify-center gap-5">
        <img src="/public/logo.svg" alt="logo" />
        <div className="flex flex-col items-center">
          <span className="body-small">Better Than</span>
          <span className="body-large">威秀</span>
        </div>
      </section>
    </div>
  )
}

export default Sidebar
