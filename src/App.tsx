import { BundleBuilder } from './BundleBuilder';
import { ReviewPanel } from './components/review/ReviewPanel';
import { BundleProvider } from './state/BundleContext';

function App() {
  return (
    <BundleProvider>
      <main className="mx-auto w-full max-w-360 pt-[31px] md:py-10 md:px-6 lg:px-16 lg:py-12.25 xl:px-0">
        <h3 className="text-[31.88px] font-normal leading-none text-[#1F1F1F] text-center block md:hidden mb-5">Let’s get started!</h3>
        {/* Below xl (1200px), Builder/Review stack in a single fluid column (mobile through
            tablet-landscape). At xl+, the two-column layout locks to the 1440px reference's
            exact pixel widths (768 + 29 gap + 399 = 1196px) instead of `fr`-based fluid
            columns, and self-centers via `mx-auto` — so the product-card grid inside Builder,
            which sizes its cards as a percentage of this column, stops shifting width as the
            viewport moves between 1200 and 1440+. Only the centering margin grows/shrinks. */}
        <div className="grid grid-cols-1 items-start md:gap-10 xl:w-max xl:mx-auto xl:grid-cols-[768px_399px] xl:gap-x-[29px]">
          <BundleBuilder />
          <ReviewPanel />
        </div>
      </main>
    </BundleProvider>
  );
}

export default App;
