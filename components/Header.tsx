interface HeaderProps {
  topic?: boolean;
  topicName?: string;
  topicCount?: number;
}

export default function Header({ topic, topicName, topicCount }: HeaderProps) {
  if (topic)
    return (
      <div className="mx-auto max-w-7xl px-12 pt-24">
        <div className="mx-auto flex items-center justify-between px-0.5 pt-6 md:px-7">
          <h3 className="text-2xl font-bold text-gray-200">{topicName}</h3>
          <h4 className="text-xl">{topicCount} Articles</h4>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-12 pt-24">
      <div className="mx-auto w-full text-left md:w-11/12 md:text-center xl:w-9/12">
        <p className="mb-2 px-0 text-lg font-bold text-gray-300 md:text-xl lg:px-24">Bits-0f-C0de</p>
        <h1 className="mb-8 text-4xl font-bold leading-none tracking-normal text-gray-50 md:text-6xl md:tracking-tight">
          <span>Explore </span>
          <span className="block w-full bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text py-2 text-transparent lg:inline">
            Learn
          </span>{" "}
          <span>Build 🚀</span>
        </h1>
      </div>
    </div>
  );
}
