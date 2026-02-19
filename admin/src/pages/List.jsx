import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({token}) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
      console.log(response);
    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.delete(backendUrl + `/api/product/${id}`, {
    headers: {
      authorization: token
    }
  });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      }else{
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);
  return (
    <>
      <p className="flex flex-col gp-2">All Products List</p>
      <div>
        {/* ---------List table title */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm " >
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center" >Action</b>
        </div>

        {/* -----Product List ------ */}

        {
          list.map((item,index)=>(
            <div className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm" key={index} >
              <img className="w-12" src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p onClick={()=>removeProduct(item._id)} className="text-right md:text-center cursor-pointer text-lg" >X</p>
            </div>
          ))
        }

      </div>
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