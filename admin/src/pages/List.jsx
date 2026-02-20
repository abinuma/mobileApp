import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    setLoading(false);
  };

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const response = await axios.delete(backendUrl + `/api/product/${id}`, {
        headers: {
          authorization: token,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);
  return (
    <>
      <p className="flex flex-col gp-2 my-4">All Products List</p>
      {loading ? (
        <div className="flex flex-col items-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-500">Loading products...</p>
        </div>
      ) : (
        <div>
          {/* ---------List table title */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm ">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Action</b>
          </div>

          {/* -----Product List ------ */}

          {list.map((item, index) => (
                 <div
  className="
    grid 
    grid-cols-[80px_1fr_auto]      /* mobile: image + name + actions */
    md:grid-cols-[1fr_3fr_1fr_1fr_1fr]
    items-center 
    gap-3 py-3 px-2 border-b text-sm
  "
  key={item._id}   // ← better to use _id instead of index
>
  {/* Image */}
  <div className="w-16 md:w-12">
    <img 
      className="w-12"
      src={item.image?.[0] || "/placeholder.jpg"} 
      alt={item.name} 
    />
  </div>

  {/* Name + mobile price & category */}
  <div className="flex flex-col gap-1 md:block">
    <p className="font-medium">{item.name}</p>
    
    {/* Only visible on mobile */}
    <div className="md:hidden text-xs text-gray-600 flex flex-wrap gap-x-3">
      <span>{item.category}</span>
      <span className="font-medium">
        {currency}{item.price}
      </span>
    </div>
  </div>

  {/* Category – hidden on mobile */}
  <p className="hidden md:block">{item.category}</p>

  {/* Price – hidden on mobile */}
  <p className="hidden md:block">
    {currency}{item.price}
  </p>

  {/* Delete button – always visible, better alignment */}
  <div className="justify-self-end md:justify-self-center">
    <button
      onClick={() => removeProduct(item._id)}
      className="
        text-gray-500 hover:text-red-600 
        text-xl md:text-lg font-bold
        px-2 py-1 -mr-1 md:mr-0
      "
      title="Remove product"
    >
      X
    </button>
  </div>
</div>
          ))}
        </div>
      )}
    </>
  );
};

export default List;

/*
we use axios to make HTTP requests to our backend API. In this case, we use axios.get to fetch the list of products from the endpoint /api/product/list and axios.post to send a request to remove a product by its ID. Axios simplifies the process of making HTTP requests and handling responses in React applications.

when admin Click "X" in React
<p onClick={()=>removeProduct(item._id)}>
If _id = "abc123"
This runs:
removeProduct("abc123")
Inside:

axios.delete(backendUrl + `/api/product/${id}`, {
  headers: { authorization: token }});
So the browser sends this HTTP request:
DELETE /api/product/abc123
Headers:
authorization: Token. ----> now go to server.js.
*/
