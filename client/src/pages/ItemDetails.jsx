import { useParams } from "react-router-dom";
import { useListings } from "../context";
import Nav from "../components/nav";
import Footer from "../components/footer";
import ImageListing from "../components/item-detail/listing-images";
import ItemDetailsCard from "../components/item-detail/ItemDetailCard";
import DescriptionCard from "../components/item-detail/description-card";

export default function ItemDetails() {
  const { id } = useParams();
  const { getListingById } = useListings();

  const item = getListingById(Number(id)); // 🔥 important fix

  if (!item) {
    return (
      <div className="p-10 text-center text-gray-500">
        Item not found
      </div>
    );
  }

  return (
    <div>
      <Nav />

      <div className="flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-8 m-6 xl:m-8">
        <div className="w-full xl:w-2/3">
          <ImageListing item={item} />
        </div>

        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <ItemDetailsCard item={item} />
          <DescriptionCard item={item} />
        </div>
      </div>

      <Footer />
    </div>
  );
}