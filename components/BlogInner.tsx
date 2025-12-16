export interface BlogInnerProps {
  post: {
    title: string;
    content: string;     // HTML
    headerImage?: string;
    topic?: string;
    author?: string;
    date?: any;
    tags?: string[];
  };
}

export default function BlogInner({ post }: BlogInnerProps) {
  const { title, content, headerImage, topic, author, date, tags } = post;
  return (
    <div className="mx-auto flex justify-center max-w-screen-xl px-6">
      <div className="rounded-lg bg-white pb-8 shadow-lg dark:bg-gray-900">
        {headerImage && (
          <img className="h-72 w-full rounded-t-lg object-cover" src={headerImage} alt="Article" />
        )}
        <div className="p-4">
          <div className="flex flex-col items-center">
            {topic && (
              <div className="flex justify-around">
                <p className="ml-3 mb-4 inline-block rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold tracking-wider text-gray-50 dark:bg-indigo-600">
                  {topic}
                </p>
              </div>
            )}
            {tags && (
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white dark:bg-indigo-600">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mt-2 text-center text-2xl font-semibold text-gray-800 dark:text-gray-100 sm:text-4xl">
              {title}
            </h1>
            <article
              className="prose max-w-xs py-7 sm:max-w-sm md:max-w-prose lg:prose-lg dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <div className="mt-3 text-center">
              {author && (
                <>
                  <p className="pb-2 text-2xl">Thanks for reading!!!</p>
                  <p className="mx-2 font-semibold text-gray-700 dark:text-gray-100">{author}</p>
                  <p className="text-sm font-medium leading-4 text-gray-600 dark:text-gray-200">Author</p>
                </>
              )}
              {date && (
                <p className="mt-2 text-xs text-gray-500">
                  {typeof date?.toDate === "function" ? date.toDate().toLocaleString() : String(date)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="toc ml-auto max-w-sm"><Toc headings={headings ?? []} /></div> */}
    </div>
  );
}
