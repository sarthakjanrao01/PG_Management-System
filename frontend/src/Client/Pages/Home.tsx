import SliderComponent from "../Components/Home/SliderComponent";
import FeatureArea from "../Components/Home/FeatureArea";
import AboutUsArea from "../Components/Home/AboutUsArea";

const Home: React.FC = () => {

  return (
    <div className="pt-6 md:pt-0">
      <SliderComponent />
      <FeatureArea />
      <AboutUsArea />
    </div>
  );
};

export default Home;