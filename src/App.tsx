import { BundleBuilder } from './BundleBuilder';
import { ReviewPanel } from './components/review/ReviewPanel';
import { BundleProvider } from './state/BundleContext';

function App() {
  return (
    <BundleProvider>
      <main className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10 lg:px-[122px] lg:py-[49px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.93fr)_minmax(0,1fr)] lg:gap-[29px]">
          <BundleBuilder />
          <ReviewPanel />
        </div>
      </main>
    </BundleProvider>
  );
}

export default App;
