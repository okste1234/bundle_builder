import { BundleBuilder } from './BundleBuilder';
import { ReviewPanel } from './components/review/ReviewPanel';
import { BundleProvider } from './state/BundleContext';

function App() {
  return (
    <BundleProvider>
      <main className="mx-auto w-full max-w-360 pt-7.75 md:py-10 md:px-6 lg:py-12.25 xl:px-12">
        <h3 className="text-[31.88px] font-normal leading-none text-ink-soft text-center block md:hidden mb-5">Let&rsquo;s get started!</h3>
        <div className="grid grid-cols-1 items-start md:gap-10 xl:w-max xl:mx-auto xl:grid-cols-[768px_399px] xl:gap-x-7.25">
          <BundleBuilder />
          <ReviewPanel />
        </div>
      </main>
    </BundleProvider>
  );
}

export default App;
