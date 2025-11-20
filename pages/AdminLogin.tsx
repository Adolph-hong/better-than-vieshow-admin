import LoginBackground from "@/components/login/LoginBackground"
import LoginForm from "@/components/login/LoginForm"

const AdminLogin = () => {
  return (
    <main className="relative flex min-h-screen">
      <LoginBackground className="absolute inset-0" />
      <div className="z-10 flex items-center pt-[120px] pl-[120px]">
        <LoginForm />
      </div>
    </main>
  )
}

export default AdminLogin
