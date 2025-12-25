import TechBackground from "@/components/TechBackground";
import { FiGithub, FiLinkedin, FiMail, FiCode, FiCpu, FiDatabase, FiAward } from "react-icons/fi";
import Image from "next/image";

export default function AboutPage() {
  const skills = [
    { name: "Python", category: "Language", icon: <FiCode /> },
    { name: "PyTorch", category: "AI/ML", icon: <FiCpu /> },
    { name: "Transformers", category: "NLP", icon: <FiCpu /> },
    { name: "LLMs / RAG", category: "AI Research", icon: <FiDatabase /> },
    { name: "React / Next.js", category: "Web", icon: <FiCode /> },
    { name: "Arduino / IoT", category: "Hardware", icon: <FiCpu /> },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 z-0 opacity-50 dark:opacity-60 pointer-events-none">
          <TechBackground />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl">
              Xin chào, mình là <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Nhitny</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              AI Engineer | NLP & RAG Specialist | Tech Enthusiast
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl lg:max-w-none">
            {/* Placeholder for author image - using a tech/code abstract image if no personal photo available */}
            {/* Ideally replace this with a real author photo */}
            <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
              <span className="text-6xl">👩‍💻</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Về bản thân
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Chào bạn! Mình là một kỹ sư đam mê trí tuệ nhân tạo, đặc biệt là NLP và các mô hình ngôn ngữ lớn (LLMs). Blog này là nơi mình ghi lại hành trình học tập, nghiên cứu và những kiến thức thú vị mình tìm hiểu được.
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Mình tin rằng kiến thức là một hành trình dài. Tại đây, mình chia sẻ những gì mình đúc kết được về Deep Learning, RAG, LLM và công nghệ, với hy vọng có thể cùng giao lưu và học hỏi thêm từ cộng đồng.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="https://github.com/nhitny"
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <FiGithub className="h-5 w-5" /> GitHub
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <FiLinkedin className="h-5 w-5" /> LinkedIn
              </a>
              <a
                href="mailto:nhitny2802@gmail.com"
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                <FiMail className="h-5 w-5" /> Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl mb-12">
            Kỹ năng & Công nghệ
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {skills.map((skill, index) => {
              // Chọn animation ngẫu nhiên để tạo hiệu ứng không đồng đều
              const animations = [
                "animate-float",
                "animate-float-delayed",
                "animate-float-slow"
              ];
              const animationClass = animations[index % animations.length];

              // Gradient viền màu mè
              const gradients = [
                "from-blue-400 to-indigo-500",
                "from-purple-400 to-pink-500",
                "from-green-400 to-emerald-500",
                "from-orange-400 to-red-500",
                "from-cyan-400 to-blue-500",
                "from-yellow-400 to-orange-500"
              ];
              const gradientClass = gradients[index % gradients.length];

              return (
                <div
                  key={skill.name}
                  className={`relative group flex flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm transition-all hover:scale-110 hover:shadow-xl dark:bg-gray-800 ${animationClass}`}
                >
                  {/* Viền gradient ẩn, hiện khi hover */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-10 -z-10`}></div>
                  <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-20 blur-sm`}></div>

                  <div className={`mb-4 text-4xl transition-transform duration-300 group-hover:rotate-12 bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent`}>
                    <span className="text-gray-800 dark:text-white group-hover:text-transparent transition-colors duration-300">
                      {skill.icon}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:scale-105 transition-transform dark:text-gray-100">
                    {skill.name}
                  </h3>
                  <span className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {skill.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
