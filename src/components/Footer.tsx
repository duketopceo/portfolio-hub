export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Luke Kimball. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/duketopceo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href="mailto:kimballluke@gmail.com"
              className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
