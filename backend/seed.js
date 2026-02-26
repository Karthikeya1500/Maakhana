import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import Region from "./models/region.model.js";
import User from "./models/user.model.js";
import chef from "./models/chef.model.js";
import Item from "./models/item.model.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(source, folder) {
    try {
        const result = await cloudinary.uploader.upload(source, {
            folder: `maakhana/${folder}`,
            transformation: [{ width: 600, height: 600, crop: "fill" }],
        });
        console.log(`  ☁️  Uploaded: ${result.public_id}`);
        return result.secure_url;
    } catch (err) {
        console.log(`  ⚠️  Upload failed, using source: ${err.message}`);
        return source;
    }
}

// ─── Realistic region-specific chef images ───────────────────────
// Each chef has a unique image showing them actively cooking regional cuisine
const CHEF_IMAGES = {
    "Andhra Pradesh_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuC-7TGM3VglkLjCLvxb8hShiwQU3pg5TyOWA53F3yoCwr8BYzSuLHx_PXfLkqIUZ4zI4NzRVbPKcIWNjOUdPUoUTrkDOfTz0ijnSx_ZV76JkIZ5peKrw_bshJxWaWDcse0gQN2ZGEuQxku040BS5sSrweC3IT7Z6nW7xM43r-I5L1ivU21OoRFZXax1E-j9uXVuMYOMTjh-QOaBJkw54nwc54g5S2p7VpIQiL5cJuMJADDTlZU_q7O1SpBmL80KjZ07aC_5f8LOuSw",
    "Andhra Pradesh_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuCVnmitsn9lGtDbC3Bh6S6HPVTyxQf_SSVd49mR_ZWvCZUxJxaYY_Eg3B-BtlhvWEQmzMtHpmggSZsrRej9F5BpCbY4jNgzEJMzws290Z1KZT7UacDGgDbtu1HESA2Bl7hs09ZeHMaXt0UHDpPdr6keJlq_fTjIjer7C6byUPNniK9jMtNHnHjz1r6WYwG0EasHm_-PRiSnXC6vLbkBB9wOGBV-sTh_fA06Eju3k0TZrgx1Iv1W9340nQiKscWK6x7Gmt-aMIp3M5E",
    "Punjab_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuDqNo6obv-ttVD8CVZQOCgMv6co_Nvy3hou_d508watDSLb7m1sRzsjezIHzTs_lV36GdbmUh_l8tIDbrNoAoGpUc-qI8sBZknzGGQzmy7EPl8Jmr5Gyat4T1qrKqRRfvIMO3H7YPf797_R_o_mxoa4jzqFvIQOvpTifJi-cu0AVDYsZ2ST9bLw7vQSwkTcEK8tvPDeyE_YlYc6riJpbSwJLx7y0vr_uc_J-dPS_p0JgHpvTo-ZyNYXmi3ZY8RPDEoBXMg7g-jp_u4",
    "Punjab_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuDNIXhFDHiugyjcove0DXrlYSlQb2iWXzkNwVkmAGwkFXWmnnmxI8g021vecbZFlrK28oC8_mv14xyc5Wunc2JiuaGQ9H70vYHzWvAShzx2ys2LXqsFEsqkko5Xs_Y7RekOCmAndLUQDKSUy3kPDq7wiRF3Tl1vlkCZeypWoFrCs99d84P_ydE0yG3_jfuDYfkIuEuFnfbQy-7TQ-NfwcV7zs_Xwg5URIoMMttg3NclzjeR1fpqMUl0hX-Ikspcq0o2LGazf8uUgnY",
    "Kerala_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuCJR8pXhvE4mmSIPCNXjkgeOIvcs-ttH53_nJTS1A7BHnNQLl3jNMHfs9Yx9aAaskOY30XmXFchOw5Z00DTVDLpuymj90M02Cdiuckwdc6NLjOwznTvBaI2IPyGHrvUM2UR6IrfvA0ynexHujXmaVR6kixgdgNv1nqhn8BU_XZWS8PbJTvgXbVE1Oi0rtahaD1qcEFdfdmjLp6cV0AHBmwOHSLwfeUGjfVhDn9oPbPeMWE1anM17GmEybLuYPbU96EaQmxC_ibQ0W4",
    "Kerala_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ElC5zAZY6L4gEalle-I_QxzFjisyrJx2dMJC71XIYOwFFtmKZi7LwKWqGxPsSvpwfZ5KfUR4f93mu6249fYooMNmKnW1bdKsOtV7X7YD_U7H4-apZWUFgGmWI8cUZbiDDeM98UV78UwF5TnkVe2A6hVcFInmI2GrnxSU3rxj4hOEznxDmkV3uBY_2DkT7xj_Q7nQ8hz8i6VPr3eKoAcmzxAbmx4Iimipc6BCGnF1lpMHGSfge3-a6CdioPgqg_qMW1-Yi_wSWUQ",
    "Tamil Nadu_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuDuySFT6dxg9tGuQe5cvWqGlIQDFDcnr3kPVTFiOUSvW9I6Cz0MWsxQ1c2y4P5QPIEX2eA9DkgaIAeo-Myg0GUY7uXCGZd9HFqeTXLLIMY2wCpExC8BcVRDeqU6kLoTuIMYIZYIxlKLfdkmuF5qJn9zeNPoGYw3SFNfyU5soFUWO281H3C2JjLYyg8IIgT9iUgkz3NC_MDr1m7NNtrETRkge_ZEonHMgr9Ir_St-NtyTNMyWBkJMeJu5kOmXUJmgbKwdMkWLWA0sF4",
    "Tamil Nadu_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuC-7pcMtg8OPf48eJFqxBwwQh0PX38DWlzFFxyXTFNfoZanPCPfl84RgSmgdZKJjw6U9h7Bx_jFoMP0kcTROqiXMFkQS7st4Q2orffX7gM-EcRSt6Vf5K6JWIK1_FqrywwPxv6eppxoFbpfSfloKaHZM87CVPOJSKVg2Vm1SJyzwVrwUEwrbNrB99eUy_hrNHruHIa2LMzYTE-5IJ6eiogLIDXlwWPfj1XpeGFN8370yARPFzVd6LKIvSoGIcxYNSRASaVSkTsAN4o",
    "Rajasthan_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuBitKfB9vyyDMlsbVzIZPMl-d1VmOZG44zFmEiHlbO8Ow0lHX3Ne4CJhea2ZvFWQtiNZDF8kVYnOT8hMaIw8Y97aKSnCFtIIvIS1JrFOs9EDmZZynrX3u9mb8yg5Tf_W8wwIP559UoB7p_1vubuvoOy0KNRQUem3iyMEx230X_5liwEB3ua8VMsOeGM3lZCsy6IlfQ5xBUlj-oRimLtryV2D_RdvBVKoneWnbjhaLPBq3VFhXgK83h9RtJW53zsez5ouQJ9DxBB0_k",
    "Rajasthan_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuDpOREFqJ-SrzAeWSTxXWw8svKJbC6YcEdblA2CI9sCoIReU5-eVBaWGlih8s3v2MdiVTPdaD2q0IfL7IIC71wbXMRflm8j8g4_aoO7YDF5o-UIYXopwazyX0vq2aMqvoW9YI4QUufOrpfhTVXjTkLmWYe-P1zYE9AQU6OmLctGKd3SBONCB8Yud-cGq4GdyfOy-dGO03r9yXDVvHNoGrVwYqQ3daTYMYW2e54fZiGT-2RAqxmazEZBwC6sa37dsqlFkkOlLpYJ3ck",
    "Gujarat_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuAIA_aazvtfeYy6zfjbpJbTB-YfLienCH1sVtTYUePWfYXyzTSqby5HSWbYgIK4K49oswe9d9dJIIEFvEtSN9bNONPfetw75aylU29yboVOiGpcguW32rIyy5DovFco0aBMfFUdhPkzVgnrqJrPlApLd8MScXk2SmdqM4AbEyRUTGWBmFCz4eczEX3NP6ryy1cdrwNh8BgJXtJ9SV63UP7EjbuKfZMAVER6i9jIIbmBACc1KNY-puJsXiZpjEc_o2eqj8iCy7d57ZY",
    "Gujarat_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuBNMGH8hhe0-7ebZhL6U7WxaDgVmYlrQei7g1pN6OtXZ-2V8PhpEqiZ2t1C_64_zV1EVdXUscR-g4YV1f2v99opiK0y2RcYnrWrwIz9a6d3ty5nTzHxVfb4SpMJOgpCSFA4irKfPgRMenWPsYdCV6GZzsrm8Bje-oHfEwdHbR79yHHw4MRdBwq6LWksWJrjJQtayxjAYEoQ7dHx3_IASBmlgjm10NlQjyjSFfbRWRowZgpeeMRA3CyzwLbKaRmgC5z7xVa0P7ZujQY",
    "Karnataka_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuAsXtoud2RXivEOl6ZmonCNoVOlG_pmSePzh_cEEildltASB46lp6n9Wiz11dVwwcBtV9yOgCYxGMasr6w788cEEgzI2BEMvALXLbHH8gxrfUxGxh_AHX2XmgCMXXTKUNf7A3cRiLtChYDVfOA579ea07AqmzUBE0aVzQLz7c9eGbQ_qN05AhNZM_dO8uhEz1OjnlE7o729F4SFyE6onTd-5n6IjysS49pqG-3uDEaBj2qktFG3BMn1mMp0vXJPfXyYMGmRnY5Bmns",
    "Karnataka_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuBpeK1H_nwupWQTFr_-0fJ7olf_PpNpiFhdZDQYY0kdPTdANYPv9QVgz2SFfgjXuSZ3NuHIzpyBAVIqnPH4iR038M3AwhhO6Ptu2FlXAjul-Lc3SxPByPKQkxQsR3LPMuQrq6-eaTdPX-CNwZrA_amqn6yFMRu1xeFUx_Dcax45Km_3AjIE6iwjKdBB9nIqH_v3ePGiZMTfX3C8YNrYl_VtoIYhyZgxM9vbTnhjb4jHBvuvUFtU5eb0Hg_YI058xuPRfodV-lv5VCo",
    "Telangana_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuDNIXhFDHiugyjcove0DXrlYSlQb2iWXzkNwVkmAGwkFXWmnnmxI8g021vecbZFlrK28oC8_mv14xyc5Wunc2JiuaGQ9H70vYHzWvAShzx2ys2LXqsFEsqkko5Xs_Y7RekOCmAndLUQDKSUy3kPDq7wiRF3Tl1vlkCZeypWoFrCs99d84P_ydE0yG3_jfuDYfkIuEuFnfbQy-7TQ-NfwcV7zs_Xwg5URIoMMttg3NclzjeR1fpqMUl0hX-Ikspcq0o2LGazf8uUgnY",
    "Telangana_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuArTnS1fFiG58ZYQT5PSe5GPtYAd3F4ykPxS8I_i-dEQFxDhLWYPnp9xTP3yP0sDMnsmvRZKXrgF3HMB6C_dfOGn-xbegYZ_LA8kbZgdJ1Y8FoigZ228Fz8nMgymNUyEbpLc-fLdTax9p86hBNPUbkuHIoLyraP8xkuTF39VxkYjXtjH8MDMpjtnV9xFHlGEeoi-P1DBnr9rZP10SFZichnWM2-Tv2FNv7-hyhk7kaAwg0mTao-I19Sxmx5sWlryX0OgS2cISu5Idw",
    "West Bengal_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuBfeZHQ9caeFsDbeEiSLN8Je-Za0Q19-o62LVTJBYaJJm4_8yqxKeS8UMPxG_B5sBGUmbZ4YF4M9QKY7gAoMwjErXvz-1LOa5R_p--8kq05gJSoGyQqu5opH62GcdYUWDBMD8qvxJgB67VDc3wBJkCaOEq_YYEcXhrcVYLpOKeEUT0E7eji-fotc57kN38T1ELQQqbOSRM0aeQOpolSeawnIS5NoxJSTLtwLU_HI1kxW0vGBL2UrhWxmc1niOHPB9LN1y1vB20SvT4",
    "West Bengal_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuCbNmtoKAsnLt6iuOIVc8Lh9MDIAI81OyMWtCAS4hLMNus2OwbU4-oXEIALoJEVSNnNB4y6bGmFes_JbpM6Lro9cNbxIhZEBsqvCxMiz6tUebengz0xgHkJmt6t4CRqZC9d4WGGBmGE0OaGKYxflZrv53lUe20YQzTJcQ2jsavG1RTsC7LMdtX8eea8-s42V7ZMpPjjdtjTAx8HunUboXYlvuBL0uQB_2hDbSlxDNr-5hwrDWMjhJizne43bEF9wAcBEQGB1RWeD3I",
    "Maharashtra_1": "https://lh3.googleusercontent.com/aida-public/AB6AXuCvvyiK65jvvfk4yeWwy2ayC3nXUw3ET4mbZ6lcbG31O2inHSfiGZ4_GBO22hw0BlkboJMuwDlei0uvTuUGt8K_beEWUp6J_yTwTLZYIDqwiUy9bRujSoaQqZ9L-ceJL7E_0zcqZ34wL7BG-Zs-8MFnuceMgJfOIhXm0ZD9SW3std9jdxo1AWrsK151ThS1pAQr2aQdhxHUAQJQr3r_lzC6C3lJR9aVYHWlhcAfT21nq0d_f4CYbwORN9z3ygVeoSHOm5Dyac9RPxo",
    "Maharashtra_2": "https://lh3.googleusercontent.com/aida-public/AB6AXuA_elaLSZW8vzr1FpMVy5nONC_cF3QQqGp_u9IOjakZUETh4ypre35vbZK5ue1sJnctIw-mQ5-jSlDaNA5hxAEs1bE8AyYN8NJS9YDZnjao-JzpIw-VvODDNsql8XhTHoDcVEBagxSolpMi7qcqbkyeS2Tz5xeJQGB9cUfYd_kxbTvMFTIi-Q7pZ_D6sKpNMnGUltzW3744VwAx62ooccmI5TrUnyBJv9LiaKg_4DTIqc-zFjc0Qpz6ucZ-FDypScXJUmgVYdhdYGQ"
};

// Authentic Indian food images (royalty-free)
const DISH_SOURCE_IMGS = {
    "Hyderabadi Dum Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    "Gongura Chicken": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "Andhra Meals": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8E0CrcKxWBMY0aAX-3y_R8ZvI3CS6G8RtmA&s",
    "Pesarattu": "https://blog.swiggy.com/wp-content/uploads/2024/03/Pesarattu-1-1024x538.png",
    "Natukodi Curry": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVaZMjXHInkiAQjE2VUZbLWpUqqchuLmzQvg&s",
    "Ragi Mudda": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9L0Te31HLkxkzxYzS4Rx9P2IPlqvakcf5eA&s",
    "Andhra Fish Curry": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop",
    "Pulihora": "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&h=400&fit=crop",
    "Nellore Chepala Pulusu": "https://lh3.googleusercontent.com/aida-public/AB6AXuAe0RvqBkE-bBtZXQlbgB166ymF_-8XPjTb2JFsyxTKFgRJuSerxVkbfYX6fRpT699u7k8wfsbq412rRKd2IE-R8CdS7MkZLBzfHvAj1rqNFI22HfYzHU6mxaxXiBQkuqZqkygIgmm7hBRl8cqz7JLbzxct-C_6Gk6zKCE0Yz5pL_FJUvtgGY_aDau_VKtZyljlJnFGQ0rh1IuwsgsGUbQF3NWwNPTcDowJKl-WBoK2CP5sNnJc4pxudhsw6ZVKhGXxOEc9diAxWtU",
    "Gongura Mamsam": "https://lh3.googleusercontent.com/aida-public/AB6AXuDx_YWo9_fjZTexJvLJ2tkn2z596ALBSfNaHg8xbdSCUTIYXvAeSw2jPh3P0lElFj2j2bTzxdlzuQKwE5jZF0yAiLRTCjHYDgIyfRKJ1iGolfwGVo3kfbK3e8YelIjckwpH5TH1_jUDY65atijSxz0jFjx75EfBEFauExq1Hf0stpWFOeCaUMRBrAwllSQ29r2lC3d5tgYdbpjjUCZfBa19_2WHQP2JhSpFSayIs0uR_LjQxLl1KNoP8mz7jhzKIk7LpzHy8Ihk3Cw",
    "Royyala Vepudu": "https://lh3.googleusercontent.com/aida-public/AB6AXuB8jYcYDssU3SDXcBeWMcnOpBK06jpIWLXVQuW_Rs7B1OgHaev5DTzvv9ULD0GRB3qAAmS5K5ABFztQJoBa7sdqoYA821yLj7w-N9sENFC8m-Mhm2Ptmqx5VH8oiGgyceFecF3CRT7SdzwDm7pKjOJtWYvrKw8Mb11f7SUVfK7GBVCcPug61eGzZHD-ZSJhwOHDiAUXVEdTWg5BGzp0eVw81QLyngKQPF4zYP87YVIJSvoP6z9F3dsLAhhDQ0dLR0J7-FGGcXXVdS4",
    "Butter Chicken": "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Zm_ui5qo7-jsr42vXBsTLru0bRHAywHw24N4uBtMHzU8Rk-nfjcWIfAbpAw9nW9UWizALOkUsuRIPWG88-kixjD3dvU6lWKAkBOTIyNgOiWU_vAvEyJkqy5BAptopw5qCVI8DOsVOQwW-l3ZX8R5q5VHfnvb2vEcz25twfQbkyKaFTzfIOtiLDFIB9DUnFl-uHWm_eR834iGl-zAWsz_aeBUfC0a16lWqhk2AwW-N0nRsQWROjNoExfxzE_uUK8NJ9GQ7oYrApI",
    "Sarson Ka Saag": "https://lh3.googleusercontent.com/aida-public/AB6AXuBaZ63exolZ9H9EojrU1KktrUUwnwPUiYlKHf0cj70wg_foXpfHh6pwne0qvobBBhF1m0QRY3ovG0D8MHek7zfxIKhgmXr-tmbj7KK7hOhFiVEzakcte2TZ2XYTRHlJZxwB6YgaMuxPX1tDb6yqriTQoUn4i_2mRnBIlCygkyrxgk9CXz34d3nqTsYrpcjMcU3RRi-j6_EhUGnM6CIp9at4KO8WBzJmE1BBfDnLHQ-XB2SeIdJSrXWJddHlFKYLBYRnrkqu-hTelxc",
    "Amritsari Kulcha": "https://lh3.googleusercontent.com/aida-public/AB6AXuBgvqzzAKe5KewTOzlLhUqH0ATdbLrdoQ_MdLrYCiMs1GKXaozu0WjAIDk7DjT-P-oYGBPgjaoVN8yMwJ617RDt8c5HUW89JclROAcuu3I1SoFZ3WEsdFlB6b4fHyOzkUuBLK6k_4yuiexPt7OT-9WBkiy_IkPRQtnaGQHuPdtbnp1yPIK6Xl2MRrU9qnrsD-VaFbEkBKK4ncBXbQ18zJpV7iULZxK0GkRN87qHBrJ1bm1b__Wo6AEoApokvmSAyzKc-UkC9le8JG4",
    "Kerala Fish Curry": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop",
    "Appam with Stew": "https://images.unsplash.com/photo-1627308595229-7830f5c90683?w=600&h=400&fit=crop",
    "Puttu and Kadala": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    "Shorshe Ilish": "https://lh3.googleusercontent.com/aida-public/AB6AXuCYNa_V2SYL9ttVoK8swUCIeyOCJFUoPgOe0fbSbdJita43INTJE3zegHdpSYNvyOOwWUjVHmxc3IZjKwMIfpWvfbtYOSuJh_40nQp4X9_sqK3WAx_fKwXg9ZQeCPO9K2FPfAHo66JDr_Iq_T-a2Gj9kFC-bZkYBNg2QngkJoyqU8Cpoa-OZi1gO1ZLDs0gz2chs_x535Pe-7XKwqJGrMWmjh6Dl7fvCBoD0tsvZQ3sdbzgjx8WRvcd8a6s2kobG1VmfJ3JqfHX7ec",
    "Kosha Mangso": "https://lh3.googleusercontent.com/aida-public/AB6AXuCs-PQusghRYhJqE98pN59hCvtvaIzlnm8VZzwfzooh3BopwV67n5VrahgF1WDNGafCinSrVLnUHeqQhjvF_ZyWF3qDkD5Acz_yVu_LZoLQx33nmba79nO9mmzfg0QEDBPbhymh_nRhvp-8_OXprFaFe8axTNTdlgA5vWgYRvg3KASosAw2b9RfUQ9nTuGWZGqzwhdO3b0yqFuH4Yci7BE3EAEtwAjK_c7YxDTxlo1Z68MsBwzNzlJ_vT-RgQno6oTftETY9bPzWEI",
    "Luchi & Cholar Dal": "https://lh3.googleusercontent.com/aida-public/AB6AXuBhJY5k_Ne-ngTPu6KFw1TztSVAurzcFNJRpkcM_RBqc2chNtDVUqtH6ywmABjgrdpKAv4HkY4uFxbL3qZMIACEuhM8Uk0raMPD7dUSLh6YQ8B7Z68R430DM9zq6th93_a6oV1u5kFp0dOWYjlaX_YclvfRNCS77oRLHjRdPCzjqCssrZLDAf_XtrSs0kV6L_cCDQlTvq6X2iLopzgY8IWAfy_dia5O-CvohBGdzKYwf8m0CRzefKeovraQrldU8ZEmXzZa4Sp6wwg",
    "Mishti Doi": "https://lh3.googleusercontent.com/aida-public/AB6AXuCokvP8RpR-77z4On8oPXG7I6J-Oakb-ODj9ApwO7YUBeVD2JrcQtGKeSvHbZvP4FFQSmnmAxHw9DEU_wtFJmmMMg0e7JyPuIhCohkOlRWYxhkhLMntukQwmaPC76Shuqdyjro27HQWTk5sn6Dax1-VZf3ZMlGfcORrK0GbA7031CTYgYG3Cz8cixg08dQgWK8CEKS4s8S1c7ejyFewygvXqYMlAfPhCQTpYNpH7jVrZn6P57ehChVahpIn_jhxY3rx1X98B50IYcE",
    "Chingri Malai Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Ov-z2v0eyB17-IdXiLtBEjx7Vd5jHUCrhJDVIAw9i_pUAFnA9WMIVdb4NSwgEyf0P682QNw4izpKRIiCZXTepcSbY4bEu9J_dknhCoXp3ZX8dV9VUdpeuLv-5fYyhZCGUsbEGsCr9dyYl7EOB9nECNY2demxkCaS77TIaXU7RRz3cATDHYk0B7J2dN5-K9aY_f0THecS_HsyLV0N2b88iAnqBD-ZgJCqmO2GZXaWHL9H_Uj3jRvL9tbDfLy4HuLNrquyQcSyXDw",
    "Bhetki Pathuri": "https://lh3.googleusercontent.com/aida-public/AB6AXuDkgfBg7qO2i5A0X0yfy3Sh4RWr-Fctu3R5gTym8yBUjkPpyfTfLDreE2ldN0vr1DO5Gbam23azjGefkFjca_Y9d1X-xmOOIEMTQk1ovkOmapBcQ0nEQHpaZvV9VC7fe5WChpa9u2Fe4U68l1bTqcsHrZ1usoLFEyzOY5uHEg8uxIdYbrwXy-K2q5OvM7ldzOFekJItOif6n431dmjCBVAvYfLxiNJx1BVFRrvJxazpzL2mbBuOxsR6sKqRAtO-9Ummr-DdYj_hHbE",
    "Dhokar Dalna": "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ_VHMuT9vJwIS6ASDDQUDP8xzTl-vGLcLiYfgdW7_VQl1dUDsuCDdmp2yJKrYFw0dDvgeddYv0uDeENP7iSJrAV_Jx2Xv2iHNfmBNbQ_kuUv0IUaGk51K7KbeZ3aKYp9ZpLedR4Cut96n9frO1hq7q6gpY_o35if9vR71HUnykgivzyNrfD_IzvLg7fZGX5ESnJ9GGdOGupYshSj2KxKhk83BaADbwN5_jQANLtnD21tbu4ZTNzRo5zvEhBnqJNiCEPvTcXKzqFk",
    "Baigun Bhaja": "https://lh3.googleusercontent.com/aida-public/AB6AXuDtpxmYabMrbRGwgxBPVGXKo0NtZRCNRXKIVsj4xCi8D5ZUOGOCMECxzqDClXvlbxZg6n3eYoALuVyIzacVorw5LdrT7XKNWmlxnFCLLsHqhEKwneNLcw2ELnJdL_J-P8BCgfI2n4rM-_4xzm3GZIfA3rTTWfiZ9wWoFlU3Tjh8u6g_0aPzYGRt4zmY9gkYfC1NpDP2idA21GMY8eXLjov44oUWvrh3tzARSyJm4AtcpPgjrtQyZLeezkIR78CYrVulB6pa_8mpBuw",
    "Vada Pav": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vada_Pav-Indian_street_food.JPG/960px-Vada_Pav-Indian_street_food.JPG",
    "Misal Pav": "https://lh3.googleusercontent.com/aida-public/AB6AXuBGrIavXt4ubbyoa0UoOudVVKJBIyHLBaD0lKjvBzP9xPUfnFTN7yTIMFZwmAdSLy4UN94H1-FZ-JcxfHiUWNEO5gC86QhWjutK0-zH-M1seKYD27Ch3xMBnwoihrl6ZSlRU0EXMduWw65wB-PB5W2BMfMjUJwHnUknoCsWzHOAeWtdZgXRgVWQ4X8q2iOg8GKKC6N-Fnt05MCmwGXRV9EzBBlQ20Zt2mYBsqEIZaSmzwwzkIa-AkoFO2MMr1d2OX3a_gOIw360-7c",
    "Puran Poli": "https://lh3.googleusercontent.com/aida-public/AB6AXuBGQyMWqUh9AKfvNpFu78OgqNffRf5nL1515hZXonVRpSnyobuGvN6_WrzmPeph2lDekI2yCmvxy5Xuwo7-XeZQXRQF-OuF43EUMIBi6jghXU-o-mmLU_OLB7WA8lD7Fr_qCdYkVo9aM_YRDVXCU572MUltMycv7pmTSVcpmsdHujvxzvcKeBh4UA7P2nwelIKMVDFO4cBpTyz26i2MbN5KUWQqtW_tX5TUZqprxVrlC9snMoHtO0QdkKt1HOUrP_maRBYs5KA_bdE",
    "Bharli Vangi": "https://lh3.googleusercontent.com/aida-public/AB6AXuB7LRSjnudUEjP_r3I0przM2kQDjV8Mc6-mnCj5CireCvmWx1vQ8XhOxXeuECsELGISVqdNA3ljVWvtqtdB7DcjiLoLm7cOkqvAYuRSI9AQZUKfzi03bxkUqOSCiB3jF-_B9B0Pwmak0_NNAqjEc2nxKpOQdtCtbWv_SeR-KmG2IsresTqrJ4A1aUQQYYtv20JEq43eLgyY3n0ExOoZ2LufpNv4_J32ePBB-r3nMsogUzd8hpuE99IsSOCkIrg_ZpEUqQBiALtbk18",
    "Malvani Fish Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuA9hJqa64rZkd9BhjuHWvO4i9Nq6oWitxp8Xb51JBE7mHGXS1vGLHFgHyhAC38GTRyhLIcIAn7IisUbruQjiTJoMvimjip7D1tyII9jrFrWzWuQ0LIetcr5zyQqAMIBOhSXWgdMBVIKAn8vYJP0AacM8xTQHmAwwAa7vVaRX5OApwuyAt__yH8LDWreU88VpgHIH4h_Sxz0B7myTu18D3R4NG6KyziLKiqJAooCDGLGVqymPRDkIQFSCTJ1Gacsh8EBjsdwWr1NZjE",
    "Kombdi Vade": "https://lh3.googleusercontent.com/aida-public/AB6AXuCYMi8Re1N4WzGb1ax3rAJYDGTJnu0T9jy6HVJL_y_WbHquFCZVq4Ib7x5f41DZTvwpOnZyIZsvTxOX8ituDuQgULCIck0Fexiv9Z54dEF8xJBH_PC9m7eY2fpAkOl4y7NaSftmbXCo-E7UAb3_oW3h1JXe0HaGCeNIL96TWlomso8U-Ajv3JsCWckLG8d9fxg5YM2IjejNtBNQTDtxQhXDGax2Sgm1r_u0y0wqy446QRHKa29XiWlaBWijAQCbOZBTnecIT_yxAus",
    "Sol Kadhi": "https://lh3.googleusercontent.com/aida-public/AB6AXuBZbwJRMT-8opkGT6AuittP3OJb3PzeVu4Hfg3HhR-4kdHruW9j9bmoUJ49OudKS3Fv3OULbeSJfAzTsJnj43r1tUYh6n2TOyyk8LHo5jaDQu7B4KMKf_JNkqQMyC9yh-3i32t0qk8glDU7ZkGKho0dNOSnajLAssNTfwPLkQ5dNybnss9VkIQAFlwrg7HwkphRMgb-YVxEjaSofx-U_2e8vpn5lo5b7AGKGsErJMQrrtymIiozTmEP5lsu2YOUXbXkhUmwgPZPfkw",
    "Saoji Chicken Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuDvI42d7zskdirm6A4NjySrGZo3dTRdubOtMAb6-j6I7z_aECQUvEEjuUDdOSKqjnByorCl7m2EKP84HxsrFFhM63aBylI9s4aonYQVPvMGGApblBTqaF5CZsJXIruqaxG8OSF0zCYPiBFEIpTYPr3MsO-aUUBlVUM4wxatMjG9oDKihkMKMRaxi0xPngQFAVMJ0l-8QX_XR_g7qnsn3D75-plJwhEn_9zIHRsDmPcAxuQKTRnwowaOW8ccocLO7emmuzz87tDT0rQ",
    "Varadi Thecha with Bhakri": "https://lh3.googleusercontent.com/aida-public/AB6AXuDVz6AOkyDjcMWempzmGZvCilCRUvQnd7lD8MMepPFQJxsfuF6W3XRHUan4aFnbVIs9lPu1epyZPXXH4S-faMQ9nWgsnmEzNSFy2NjXCwqSscXTYUuAucm8wSCnmhMAAa1oITiF20MAvt2N4a1AL49G5sqaiuRcPQOrsaD26qR6XS8DxF3tHhcK-3XKI_JBOTfX7R_fJ73p_87WnQmSfosR3mM6weT5FB622UDa1PzRPlLpqqkPRsF61pnwTNAwoNsFm1rf6cJzn-Y",
    "Pithla Bhakri": "https://lh3.googleusercontent.com/aida-public/AB6AXuD5rFjr_YBT4llm2-rk3gvZ4vBmV8qE-PPGQHqDOejiN8TbHxeOiq6FqjtUw1eLNrZmj2_DdOXs6cFDBSobjDlZNGa0QcdX6S8V35KeHzKO7GVsDgXMCtp7SWl157KaPgqXs69a7LtIZ0ne010DOxvCQpGOu_TGWneeGosyzyEk8Zy3FaeaK_uJKxy9ZSSzYusAibZ5Uu3yAbIdIwICjVvmLgYKEuN9WY6oyYAN-11aEtAvjkLfrpJ0TnD4yT5k1eCuTRFbI6dyKw0",
    "Patodi Rassa": "https://lh3.googleusercontent.com/aida-public/AB6AXuDnNXSMzW6VbWVJ-hcWr2x1FMVaP6fyhW9R4hQ6VqygmvR2fJg-UpzCx508epYRNby7qQaY7GUSIMunNKQMAuaNYWed8yoveFlGgzaTPHnU1kmQbpbkERr_RaYLaSiu9Oo7sKNt5XpfYVOdJilPXYxXUi7DcohWIi_lzXYWGnKt3_YkIw1prmY-Gn2y4xcf19zF03PZhPEJPoVqHUtZwywfFMG4HApKv5_PAJVPCw8O6FB5BypfiDF7IpjOn24n6FfWkNwHuP_nWq0",
    "Chettinad Chicken Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMZWe86FTYvtzYNfQeVCy3jQ5_eSOvS2oZJKIBFYeAULojzH86VN45UpATMr3FOY2qTwxYjiUDZiyQ-1b4xrNlU5Smeq_0TabbGbHOyKmW0ZI_0C2ImQHtzz6IyHX5ModNMi8UT5w8iD9E5hgUtw6WHlERHgy6k6yXzc2njkIqsD2xGs4ZPxZ7u9O1bT52LZHWlZhg98nLA8moDmJAnIYyj7hV7NviazQmyg6jDiWU2mQ9zQ0jl8DkRa1KoVLWWhJ1NQ8zHDBxKs",
    "Chicken 65": "https://lh3.googleusercontent.com/aida-public/AB6AXuBqh1QPnIVj_uSiAG15sWhoCYqgkK3rlRSnrh-ErKTJXt5EHasp3TgJWDB9tYttZsOBtnqS1R3N_1vKjGt2dLjjeflifFCDhW8HezxT70ZHeoGCaCdBMwDYECqaGrFfIuUafb82yk9EqDz941j5QxyPTNgAzh6RzpILdeFiBfXGnw5IKzMAV7-KU0Cp1WC2Rh9wZ-X1mkU0HZ1T8rkigqR9ZgrNHWK5r-cPB3vUlk59UZvUPcYgCRjHhWFCxanGj77dBYSIm2jec_Q",
    "Madurai Bun Parotta": "https://lh3.googleusercontent.com/aida-public/AB6AXuDFCbc_V_a5Rcspfl9kj7s9PMl1FefHdy1jB1z2oRR3FJnTFWrkNVQmk1fyxqp4bH8guEnO1i0OsuRwdy3lGcLs9pxfumjn4Va_rUI71TTpM6CzwFJktpwlxg_zHcrXq8mk7MYDaejZVdmLRsxnVRFFQEn-Zi5XzJ1d0xEw3Mqdtyv-EKErCd2ApwI7gmxWfJdjzKOOLlNb28gSw_bslzWSdjC7SHO-Uffnc0h9rRLiDq8jEpKMgCskZSsYOQCxR34Bc-iKE0yNvmU",
    "Filter Coffee": "https://lh3.googleusercontent.com/aida-public/AB6AXuCAveGztCMwNLYq4az7CDuJdBdIoZORc3kiVlJ3FNbuOP_0kpOlo6WCe8YLtpMgqfX2qnLfj-XPckLZ06twNnCZu0pcHRLamYm7hRcgRO6xJNL3Rc9KeP1GEOpo0WgaBrTbVExedSP3UY0E3yRp7R_mGk_kxbM3-lGFDqmDGB-4w7CxqHieAKxZ-ugvW4s6a0RSxm-UT3d5ZijkgG3SdU2M6Q4lfD1mZ0xn9cpCN_1xEBi7A4-torNSeVsAmR-Dl1M8B8PexooxTHw",
    "Tanjavur Maratha Mutton Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuCdH9nbpL60Ua4MmLVA-hre8ZTdPIXmy3HhUNkcSIAHnTzDBLotjAdRjg1owKfyfRCCQ2SUx9Il58gt3l0FLBhVXnHpYCl8907QK60DlbQk_tB0mh58r3XYiJ7e6Ssv8E7o8vZHFfsl8gaHvFUHXJKYTFeMHBfghPY3cAgHXj8vXSxrOtDTMGekkU3NQeqdruXxlj-p0oVUhHMpybDaeE04ZVg8uE3woHoogN2s_s9JeFfWyNy213fJqu05VUhCnkI5oeJom_Z0rOc",
    "Kongu Mutton Biryani": "https://lh3.googleusercontent.com/aida-public/AB6AXuAafRERY4gReDHCKW3rOpibpNyqNyKHgRAAFnar_keKbrmMxOAmjkkh-UeFZjOniP5u0VaKK0YwFH9np69jQjzJX804dsQ-qcevLfVTdOaSqH2WTVaquesN9IrGPvILEc6yJYyl4oi80FEluUhEkbF8nd1jC4oOB6gnIUmAHkUJSPbbPCbl1ffUvsCfFzQNjkjAZ4SPljJnLmjbjXhUA1zIHfIBWJ7QH1jKYnew3D6ILU5QdqMH3V9YnVl4YcfAlghr6SWwzNzIJDc",
    "Karupatti Halwa": "https://lh3.googleusercontent.com/aida-public/AB6AXuBWumJVZn7isLtmRBE3Sc-l10As_Zk6SFdYPvrwCy30kbU4zQ4HIo3U7xXflECEuCcw8ElT7Up3ivGiPJzDzKgbd9V5GRzJylzz2YKP17KxJQGn_LYVz68ktk1JrbUwEQ7iJVNhDkPUn7vI2MFWVEi2mNAEK2HTeVsu4s8YGvWRcwEF3oIdjk8xxQD3H03SnZfUzg4RfdsGE04UtYQxl6mJqPKMoNyMT7Nt___Mvkh3pjg-wn95hIyBV-ZsvIrpPtUSG42XwXZghfY",
    "Authentic Rajasthani Laal Maas": "https://lh3.googleusercontent.com/aida-public/AB6AXuDv7UVvdw3U2adN0bVF-sJdpMGQiwzybjGXxUxPiavt3pl9fuesPjNhbI0pntNYNCuaNxry0jiiIaLi3SOJMxm3i5UMAWV-AnzY9_H26olU0BMS82rVYAgH1kW2ixamGVTcRVmqp67CuuEkrftGITChOSnM3ljE5Cmk0xtBo4CP5P5RabjYfaYkgl4tgyt0_d1f4L1vtnO0GdMarybAIpSQ1vcUuXSPUnm_x1lUPEaI0fVl0seTt3CItQ3QdURPV9GjarZPRpXE9mg",
    "Ker Sangri": "https://lh3.googleusercontent.com/aida-public/AB6AXuASX62waznFvpKzgnrCg6Okeg0DeY9bdu79nnwYr8LXmHJa36ENhXU_vtEpKMv1AUHSyfhBGR-x96SU9iCnrR9-a_D1nYIb59iOZh_ogz32fsXegVx8CME8mgtkulW4ZfjQqKcsD3Og6mcWbTWwEqR1bObV1KdgIk0zpG3pKwJvBg17nZAe347PMBCg7YWvHduYpZvo028YfVVjVLSBRdyXVjPApi7TEhHJy9DZvWTQO2qifC4IDZsTf0-MevoQIAyqn7G8i6kI0KM",
    "Gatte ki Sabzi": "https://lh3.googleusercontent.com/aida-public/AB6AXuC0Q2hZRqxdEvjwAXvYyyWBxIl7J62DtuuT3kh9K6Uya3k6YblZEKeC-SM_C3loeX-7u71AIwYGPu3OEbehEti63zZoUuRwlwNIxM7LTBzpXUUxDTeaPa536BhLwk4vwMJOQT-P1YHuedt2Aq0mYxcwPrvaguu3ElY9fAoOzPz6EQAF4vnI2bOrX-FJgQXRN-3GHisatG5V_lTwajzXJO4c-EDgyHNJV5QKJeL2B4DZMZIFgVhhK-qigYymJcHathZMiDlNffIONno",
    "Bajre ki Roti with Lehsun Chutney": "https://lh3.googleusercontent.com/aida-public/AB6AXuACL-FTgcut7K_4l6yz7yi8kVPN75PRSnNXd1UWE4YhzY3xDI7Kx1pgO1rCiwfMkKoBcccem_K-H4cjkIcBl_WR24OuFOhMcJ2xvb-rwuEnM2YOeQSiHTOGw9zXdnNeWRkEAdq6G9PWG9YkkIREpGuq_7BqUYFXGLmMf2JuGNX07iacqc7xXYAGPHXePlwpDEZkRrpGPupondOLCLFE1AH1u-7zOAveZi_mdFKR63pmILRgSn7YKBocaHdd67XGROt3mGf9g5zbg3E",
    "Panchmel Dal Baati Churma": "https://lh3.googleusercontent.com/aida-public/AB6AXuDiKXxbmNmUjLsSuGW9ywgZqIhSwyYSEzJRP-8FAWBDSyPazN0FSY5x0cYO_Eo_sXjMA4yDpnD2GnUvrLv31hFlliwHe-WwV3A46YyrEnrbgBVh2sAhXRjqueAg4MJyqtPChcEmwFn2fyDdNWwdKX77WLglA7ZE5yMbk-A7Uzysf5cZr8iqBf1yvhe_I7XwX2eNRl07pJzkDNbgiWnomN52I2F7UPgcwsG8cvFX7VBlG7CqzIWlh-3tcg6k-RfiE7XiRAdqaOsdZe8",
    "Mirchi Bada": "https://lh3.googleusercontent.com/aida-public/AB6AXuBHcT_aVNUgyxrFw1Zk5Zj3xQDAWHDGY6xRBg32GEaLiWxtEO2DrXhneSXSlCzYOrbXfhfyCNERghNytCiyaD_NJrQLY6TmwvI9ed_HEpV5VzdLbs1zDjc7jvWNnfEcp0td_3BtEsQzEKqmuXKjuXLz63fizpnhY1h76VnZOxso19jSLdU6Quk9Xa1VPphMaW2gPpWv_8iFUyGB9BdsUuKpVf7v-ACiXgqaYh5Q-y7vHAQ0Mg9UHGzgWO72ZGj2lgHTTeEODWCDfXs",
    "Papad ki Sabzi": "https://lh3.googleusercontent.com/aida-public/AB6AXuCAXI1-qXR0KhUhttiVbOlnWxjw_GMHfU7f1FE2BYGNBLnIk6mmt3PyOrzhrunVPZ5Wwf_OnyQ9LJ7kux0hloAhNqUs2ZYUgjJp3N-fxT-J8-3ktQR8Euw_7zK8bvQzzI6ZAKSABb0kIlmSFA0A1vU_PO-sU63FQe1FzsbUvZ5h2gHUbEEYP4vLScqiQhFsPFg_Fni8yxUb7eVUrMmcW8xg1GP6qhxzAKT85fev_5lC6_6LdaRnVoil3U3tYOh827HAvSITBY5brTU",
    "Mawa Kachori": "https://lh3.googleusercontent.com/aida-public/AB6AXuBsdrPSlOwZBMd0aTYBGn5YjZjGkZjGcVl1ir_Y_9dHaj2A0z7T99R0AAUA4k2WQ8fImuLO_ulKoc1qOO80gxpdzN8u-TbikH4XmF2Kh7bEkN8JddpJazXr--iZesyUfNly1IZH6rO4SOXCXHO2p589yfPX642M_TPGt1PqtTQLlKGjXlOQ6GJPpCGjwSbYAleojKnkn4CI4rOPTFJ0h-IijlaFbQmVPqagM0_njRG7Wele8HOffHWTRQjOe1U2cnTWSY1RKuk_KkY",
    "Kathiyawadi Akha Adad & Bajra No Rotlo": "https://lh3.googleusercontent.com/aida-public/AB6AXuBdselM_TOR4oybQ_Bc03DNNQiNgUzYgFXrwKnqyiY3d4QDzidYuCi-db_fY523P2SWgA49NuufVfd9k3yJLEMRCbuY_vgsdXlEjeTpxBAVYl2BxYvBbuK-H6Phqx0Otes997r-J9eA6FdKQRoPcj8fQet-vQPv9jg3s8ybm6kqRDKgftMhcIiF7GGkAkQ7agdI1Yqp3F0TJlfO9dcolouxlzcm7WS_0B-76TNr75SQqoT1RcNYCpodBZbo9UIaKVx0LqKyYbd1o0A",
    "Nylon Dhokla": "https://lh3.googleusercontent.com/aida-public/AB6AXuCyLbYDa4nBbB57xQU6QdEWWT-wjLnf2b1pFJiL2Ay9EMJV-_mKPviLrrwpyVIdM23hFRUser0HnG6HfWQTYg81ukm9e1GWiJaHl5tEcEsEtpJ3nxxlXuL2UZvKJ49HkjNeUEA04J6sG5BY4TDZgA9OwOuVfDuIwFrVbE8L-9OKujyipWiaepUSoDiKU5OUcj25GJ9qF-3W04r4WWFDp8H8iUfrkvx6CTMBqih2XgbLsiSQOgIn-opnzEjpw_O9MfUw5W79vQPJzj4",
    "Surti Khandvi": "https://lh3.googleusercontent.com/aida-public/AB6AXuBbRyZ45JSi3nKw86Ohp9GZ9LIlJYbYAtaFsaBZ7EnP6a6r0W_Zq-SJD5zzxkW8i36oxZICMZacOmZQQYQBzrwp4lvwz1NlzYpic3VI4dY-kwahYQKXibeC0bQQ5o5UpWPn92mtj_vAGfe3jgttXYR8zcNmnJP_PPs2KXisPPfWD9mKamh6GyRG7lMes_iIgrn1v9zMN4-K2-wCTQMMoW7xSAb92ooyPuD2BfVL-MEzaIyqPKB0iuH3-BJ_zVIiUItHsBZ6s4tcDdo",
    "Vagharelo Rotlo": "https://lh3.googleusercontent.com/aida-public/AB6AXuAkKH6h8a52adW32jqtVBaj_PzHB6bYitCNvTVXyXPUj6tykwtx-ywHPS-ymixxByuHvEZLX9Wz3YdkqCKHXYwbAhRrCVfv-QueA0qXxCXwTe9fl1oEECs17z7YnpVf3b5Ezr5jKsFe7ClOYRjLQjFlbLluzXZqq7linZizOmqyCrbQU7pkGjf-xoZSl1cMdKA3zlOJamT3lrNY6r6OVPMi2OWjbbbNTF-NctY6ilcV3N2UbDHfuFLOQo5TS_4d5IGMI-0vJeudd_0",
    "Premium Gujarati Thali": "https://lh3.googleusercontent.com/aida-public/AB6AXuB8oJLoDujM4mKks4QGALxe_FvzcXCBJjt9NWBZq4-W1KV1GElUxhHGUjN1zNLegJX3nr5YrtynFiG9Pshwbxn9p8ekUj8P23HQNb6w4YsgogF1PTaPpeURCHlaH-gEqtyqQJa_CGsjmnB-qTke1B87S65LMY6I3sV6-G_pUGZobdXy9PQqG5Vq3OsqCtNBu8G8GHbe8EXZSysbayIjDK8RuddM0WzqCbx1hivq7l90MEFTX_Fumjb3h7xMIucrWqhmuH1VOP5EsjQ",
    "Thepla with Chunda": "https://lh3.googleusercontent.com/aida-public/AB6AXuAkPDKaMfh2B5Ok__XvorJtE2hmt0mFBXbDvt3p11eV8Qs9LvLkjrxclAOpCpXU8Rd-6jDO8r3zZDy7B_xbvkJPMsq3UB9zfWqFN6szlutisoRFyGfWp-4pWUxmLT1OaOckXHaV4lyvSyJehuNbUEXd-A5ylXHn_nmlQYvFexh7zr9NJ4yvHiYtSbmQjqYs4uVnU5pZQ10ielI3x0EMHUdCIQQoz4-rS8raqmPs3ZSR9rAVo9Aa27Q_hz1wkOsdecr0ASy0pSL5azA",
    "Fafda Jalebi": "https://lh3.googleusercontent.com/aida-public/AB6AXuCiQwVgcH7mlxXaofSpVtsTeWcSMA5-b0gk4nOB2jmEgcdhA6jKo7QeEIZwr_qDrlCduWeG43eAnOT5lPejRUikOXmpMul549KrzQuODJzH2c9HVHs8tvFFCNrecwVjVrQgM5R61iqcTRqVJ4LoCE0SBDXGP-tr32RxAjTceGZDbQW2qw1fiE7jKXQH6PtVusiTa_QO5bV_gIMdkkfR0BLFtOZ0Pp08hCKmsfKae3pFROyTElpNORVUc3690IZy5VQ61vjrDXXZCG4",
    "Gujarati Dal": "https://lh3.googleusercontent.com/aida-public/AB6AXuCd_gH24G4O2xptQX2YjyOJdaZP1YVVKWm0h-iyFEWzH-WIMBKC5sHerYWghdPafgBHEqu5nwMc00c_bOJ2Y02j6_UCQoKe1k0muVptOWT-g2IRpnYPLSxAITODC3q_4SWJvIATB54V6QUVkaGsBDqMhS-fKI7LnyGk6_AJ_hTYVVQmwzncxPBEeqIQQ1GWSKoFjlvh5gJO6VnPML5e67a_22hrT3Kl_O9gVep0zRCb3HXeN4c_u_9dSvD_IvMGttT0G5XwTjc-lec",
    "Poha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=400&fit=crop",
    "Gujarati Thali": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "Coorgi Pandi Curry with Kadambuttu": "https://lh3.googleusercontent.com/aida-public/AB6AXuCPWjErNxHDzafFCOskIP9MpdDNzo64KADKO1nx820KPV7McB7RvfzBpSwoWVaIZ8sz57KGLvSB-u7jAGVOr4GqU-wCdwmgmCLqy_V8uOLZJBRezb6jh2-zPO2CgEmPV5XmIPjJht6LN2cM3ugrhtUphbqZAyYA9TzPwFhOxgwLu0zRiNb1db5nbdH8FkHm3YcRPsy0q8iyvU_d-sBio4zSssNRPTMKbd8PePH9_f-FPzTVJYzQpkXD4WhcEV9JFWGV9Uk8NBvAnyg",
    "Mangalorean Fish Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuA8_92EWXy2673BHblwue7DTWJc0bPMpMyGyuX_pDa-M0tv2aUVJ1g-VNmEQ_acp9w1R7wJ-fBVZ0MU-GQpl4FE8_iMIVuX0TlUk6rsc1Btjgbw8VJ_FjTrNPzuVdzuOkYuKhREZ147i5FbPICGanj6W8NPgblGzX976i5ZRAyiDOeUJFRLYQe5W9QPRwhv-tagGbu1z6axDp_aY2lcwdxbrrKKfWvmN0Jd5SV0gpL3xn6XoF2r0VOIcAZhOR6tC7CZMLowXvkRJ8g",
    "Neer Dosa & Chicken Ghee Roast": "https://lh3.googleusercontent.com/aida-public/AB6AXuBaCaVPriYK7APWHHzbunuQMyBafmstfLwiD-PQT0NF7CTuZitjZxIInyvN7ZodiYBfBnJLl0Xn9zm4_gsnKs_zwMFwR_NX0XVjz8icRqqlOmD_4wlKnJcZIlo1TmLr2ZSd0WUHtj4JHkUZ4J3Trqh_2vwJKFxP0e-N5jvp__QliNQ9hrch-1iDH04n4AJj4LkI3h1PdPl0fpxyhek_R9bwBkV8423QeEBWfvfSvF2mx-AOd_5e3VVzwkFygdk1VGYrbKpU_fEK4Ss",
    "Kori Rotti": "https://lh3.googleusercontent.com/aida-public/AB6AXuAVKqDdcIwhH2AGbID1uUvUHrCyPVqNgsfGonfQCAxzF5FgaBfInnvkd6AfSFLPZu8zXmwpFdrX_OJHs52GN-veqZDMW-sTTm25RPkiqX6lwMi1dfjFac4Ckg2mF1arFoGfMN_6tkP_hQFsnHQ8F-hELpcpHso2xcxCcdT5k3S5JGcK2fOb6sMjAWHqoKi3GjRxqqCUhkU3jMgdYY7QZ2N_DQegEHd3JbzbO0wyirnIiQK8j5JWdedcuZjle2mVp4sANS08ZEz5HSo",
    "Jolada Rotti & Ennegayi (Brinjal Curry)": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKd1eZRTOHc4hOmi24Vxt_UZNxW3Axkte9QeIv7BCG7raniGOLQfXTGnY5BpR2qSTnLfN88JCheouhkGYt3gquPg_O-tKLcCWqd7zbze4vSuhOAgtENJcNXeHUu4klHgDNLSIFGHZOc6Ln4agohjFS93PgcVVG6-feT1B7RuPcC6UZN3OFUFazA5uoLcm4SrHVwLtwp48sQKG07aGeQi_0-wlHugGlbIs5U40rdb1e08Wrv4t6DQCGYtTAeUWqgyz99ka20ZcjhJg",
    "Shenga Holige (Peanut Puran Poli)": "https://lh3.googleusercontent.com/aida-public/AB6AXuAij_cmnAXzCw-NEsOhDEf9brj5g8IpY1QejP-zQaO5UCE1QPckKUKeC690XroXIbjJOYdDsVVyu_yVgueTwHh1cJjVTHXq_xdMOyuySkUpDg-7cUs_4Wq9CrCwEy8asDrlUxRe8k9rac1giuOUj2xgLU4JjctpCyIDarwstYxv1Hf4qD895Tdm-9NQmdgz8s1HL4MJOz3FxAt0trAFeEApiIU0gKezvmIpXpsF44VxGxhFspEQK1wgKY7FdrWbexO4_FZPMZpa8As",
    "Girmit (Spicy Puffed Rice)": "https://lh3.googleusercontent.com/aida-public/AB6AXuDMQr9N9Pmd4ZDSRyjeitdgLVmKlVReUeqvW_pK6Y6V0k3cOP9xS0wblKhk4i7I9mxYYEOmYbuE3vDRE3ORRwSQ_6GQZGJYfD9LUduuj_tlenzWdC_e6--XENRPTTFMnKWtMJli1AHm2u5CG2zwqGd0-CBKu9Jm0a-vEuSijTZeYv2xg42HqGZwxZPVKIDb9jDZCx5RVuwq4ecEE0XJcW6W75cAkegiQrliwqetbw5MqZOWuZhk6afXj3WgMex1t_HrAnKntdSBwag",
    "Dharwad Peda": "https://lh3.googleusercontent.com/aida-public/AB6AXuAud8-fQBxcrPYVDlax83RGwfxtYtTSYYh7ubeq_ceVbD4wEr-Yza_QNkSz6Hno0CHDqTTuV_rvQoPEVH0_fhtUY_Gf2EUlxhfTAzlqNVj3jnLt4Nain0afZ3F0Mu-f3oekZhJmU6m6TKtMan3OGsM7oflw9AlAUMlKUYtFUq3lSgIdyuGqAPIEPD93Mh8KI0MYf9Y-qJgiNPnYuGeMG9Jvu0_sdiUekC_IxmR7A-HIUBNvowKvSEOn1VAAx3Aw1naqmkSikZ-YsTE",
    "Haleem": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Haleem_at_Hussain_Umar_Lodge.jpg/800px-Haleem_at_Hussain_Umar_Lodge.jpg",
    "Double Ka Meetha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Double_Ka_Meetha.JPG/800px-Double_Ka_Meetha.JPG",
    "Hyderabadi Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/A_plate_of_Hyderabadi_biryani.jpg/800px-A_plate_of_Hyderabadi_biryani.jpg",
    "Lucknowi Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Awadhi_Mutton_Biryani.jpg/800px-Awadhi_Mutton_Biryani.jpg",
    "Galouti Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Galouti_Kebab_with_Ulta_Tawa_Paratha.jpg/800px-Galouti_Kebab_with_Ulta_Tawa_Paratha.jpg",
    "Bedmi Puri": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bedmi_Poori_%28Deep_Fried_Lentil_Bread%29.JPG/800px-Bedmi_Poori_%28Deep_Fried_Lentil_Bread%29.JPG",
    "Fish Curry Rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Goan_Fish_Curry.jpg/800px-Goan_Fish_Curry.jpg",
    "Vindaloo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Pork_vindaloo.jpg/800px-Pork_vindaloo.jpg",
    "Bebinca": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bebinca.jpg/800px-Bebinca.jpg",
    "Litti Chokha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Litti_Chokha_Dish.jpg/800px-Litti_Chokha_Dish.jpg",
    "Sattu Paratha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sattu_Paratha.jpg/800px-Sattu_Paratha.jpg",
    "Thekua": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Thekua-Bihar.jpg/800px-Thekua-Bihar.jpg",
    "Dal Bafla": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Dal_Bafla.JPG/800px-Dal_Bafla.JPG",
    "Bhutte Ka Kees": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bhutte_Ka_Kees.JPG/800px-Bhutte_Ka_Kees.JPG",
    "Dalma": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Dalma.JPG/800px-Dalma.JPG",
    "Chhena Poda": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Chhena_Poda.jpg/800px-Chhena_Poda.jpg",
    "Pakhala": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pakhala_Thali.jpg/800px-Pakhala_Thali.jpg",
    "Appam": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Appam_with_Egg_Roast_and_Vegetable_Stew.jpg/800px-Appam_with_Egg_Roast_and_Vegetable_Stew.jpg",
    "Kerala Fish Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuAYv8w4OJ5yz2AiEWLncSDxIuGtpbL69MLDS3dx0HjAsVsq2pED1BQYTeOb7Frlx6v2XPnaLshMKYrkFU74H4pO5DkdrTWmFnw_5Z0zj_1APmdI1utCPitMOIKETbbTnxxVQNyf6lg6NI-ugP59YV51Am_SAuemHuL0BRHsh2azb6l7TiP2zZeXwyqPFxDWxS9_rXicf-JyMlAozMHnhe7kpItA6dyvq3MPm4W4By_kDoH712Txl6wErbbiQIfEHTEWWzdXCdPAPDo",
    "Puttu & Kadala Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuDZyrkft6mGsZGuULjtHIhp5Garq1O8xK3HsL4HVTPURhZVIjqsS-cSQ4b1mGBkIMC5wuVL1AvkuXWMtakGj_KQ1t-vCJVJxm52AB_jVuoyH2fkwKwkgAMn9KSznzP5nf8VyUdS9mVI0d8Mf6juOwqHVyFK7OAqImKOqhsHUExvE4irQsT2_9oFqHXwcf6YqWoTwCBzNlPgjN0yuUyukpJD1cdBRNQBZCSAkCZB4msduWRLO5G9D998XAEoIKAtRzqZwyDU5IEwFt4",
    "Appam & Veg Stew": "https://lh3.googleusercontent.com/aida-public/AB6AXuCLFuu_S1ZwVoGLJXJSsJsDbzhfNCihRRlib-yYKz6DU4bJVTqM7rFytTqgpoajjHMzyIyfksSUEIejiD_Ucm4AsStKV9uQba0SL54l6u4DeHdSctTXhL1gA0Y6wE6Oepiv9U8VsLtztRVOSoc1t_gjyd_29GNF7-SJLROO-HYLQpM-ZDiel7_O_QWPtW-IIj8nJp6FMLoU3pUdDMdLGznJwmgpwEugt1T2L6ofQt3CVpt2SeNPzhemgL8h4tRDM6jyOhSnKsfeDeE",
    "Malabar Prawn Roast": "https://lh3.googleusercontent.com/aida-public/AB6AXuCKAll-RH6iZUTlIJpfDuR0Xi3ggftb6yWwQPTLocRMHcgr_AQk7ltfamyXpWJsBBENF88zA77IPesJ3JQRsP38nwrGUhsZ6AC1bf-Rw0B4uz4FZFfrZp9sOHUGH-mzCYYv5jKnptjmVxb1-Nt84QiCN70he0jFL23MzM3xLPd-AAuTCS_fL1-tuXQF67AS7iQKy3inZm_S5rPhJeovWxv9KM8JjIm6HXQ1_8_VPvtLU3bVTFqrfJx1REBYZpwguJLjpJXVGw5_HVM",
    "Karimeen Pollichathu": "https://lh3.googleusercontent.com/aida-public/AB6AXuDjMUDbZ8OLndTxhjE26yEfX-ujdg13dWUU-PW67cawEkz7R5vgOvZOER15YPCiytBOk_JZdv42p6iJLia7X577_15UTA5-MV3L8kZsYNgifEAhR9NjXmxhx9cGewCNitqQ4DLKxmHXRsC_Vp5PT9hMXYhofQCheNt9MFiNXCik0n3eehONtVv4bbBF-fd89R0RAR32ooGLIUaxuCm9h0NOKj0YgTkAWY4OQRJJ-GoQWam-O1PWNXGxJE3mtRFcDOCv7w5jlCHmKXs",
    "Beef Ularthiyathu": "https://lh3.googleusercontent.com/aida-public/AB6AXuB8zvrCbA46FmWECtW7mXRj99wMPQsYrR2Nis8E-vqTTQFyw-M9_jqc0_TNpD3UA1dAd0Jmp-I3UGkm6OkeE-Qy6ZInrHY1mVULH0oqDzYrBLAt5may9rXREJDYt8Lz-mHQQVyQLre0SKHb8ybLHWiSs_lY11YPx_e-rZ83aG-2_btUIok0TFcfH9s4356200dteBjoa2S6weNwKMLd72QOFOuavXnsWthLpVb46OJ2hD5roseJkr76DCe125GMtUx94JLQ3w9Hl0M",
    "Parotta & Chicken": "https://lh3.googleusercontent.com/aida-public/AB6AXuDBQUU4SxGWkyuzjaZ64iDX2RKd-limVdrIip5t2aa6fKHeJ40Fg3LbOSb6uyiAt0f7MxVwlrQ9nQwnJM3fhIF268uhSrJgcLer9ZzGWuFB24OLCYqwTOOpA6OxA1u0Vuea6Rm9v6LCJdVxaim38C95YApWm5ZpBOXHyb87WDRScP28A9vD5H-wV-0AAadtllUMgTQ4-hyLa_68tDTENicWMiFXvHTqDXSKrgmMJfBHfMHVZoSMnELv0UaiDK5JE6xVI-hosbh_kF8",
    "Banana Fritters": "https://lh3.googleusercontent.com/aida-public/AB6AXuB-FHOv_e91tPC8Tx4j46GUh3lzsrqUF7Axj_bcP0dzslxVyVvgtrlLEDdu4gHcRn65gMARBDkWFtERWarwYwers6GWhHRTXuW3IPxQAinK3iXPPpu_ug7JD3n46yKjBeZb2Tb5kPfdx9whxzwDXq6SVi3gVOz4qP_24f4DSNGiPdA0ibQTx8bC904q1ilTIfMKibFcYVVVrZYzPhKTz4QBO8KvnIKevY0vHGW6jZ7lW1CwbSr-Zbx0bqpFrdkoSyWHGkCZKuNTElc",
    "Puttu": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Puttu_with_kadala_curry.jpg/800px-Puttu_with_kadala_curry.jpg",
    "Macher Jhol": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Macher_Jhol.jpg/800px-Macher_Jhol.jpg",
    "Luchi": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Luchi_Alur_Dom.jpg/800px-Luchi_Alur_Dom.jpg",
    "Rosogolla": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Rasgulla.jpg/800px-Rasgulla.jpg",
    "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=600&h=400&fit=crop",
    "Dosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Dosa_and_chutney.jpg/800px-Dosa_and_chutney.jpg",
    "Idli": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.jpg/800px-Idli_Sambar.jpg",
    "Thepla": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Thepla.jpg/800px-Thepla.jpg",
    "MLA Pesarattu Upma": "https://lh3.googleusercontent.com/aida-public/AB6AXuCS57si0twYOKTANmP9U0sTvhWIa3SxIJ8Q121NaGK04PjE2lHIFXS7xJ1_H-vdVYW82LAOi1V9nDt1yGqyzhwbZoB8E68hps9ygp7oTHM7arlRTwS_oORf6nWGrhEVUteMrHI617o-W4U5HhZQ89zDhHzse7XsDgSXOyvw84DfDmGsrlCI7M3jtTptbJXOcb0Z6aAcD2WiYgxuMbz8MM8iHNv_ePUyX0hO6GJowlxwFwj9zFlnTQnLIdS3qjXFHrpFA9eRu8ck94c",
    "Karam Podi Ghee Idli": "https://lh3.googleusercontent.com/aida-public/AB6AXuDiLfZOyvvLP34YQ6OT2YI49qeuLhIbB0D74PMrWfIv7pdBNIw0_zdUia5uo8otFLn5uu_5c5ZUJtIlZ-WEOdXwJPyEtvfC3TrrDFsAxAfFbtxy_hC36HPtE0kLJH1v_ctCylPLGNe3c3AimLGZv_5i-TXQ1FyepR1ljifs3_AvNTLijNbmuZYol0aQti0C7PcWwdI7NODXy2y1V1D0M4eSeBoZ_hs8fVBaQzhgNpd7jayqFzQ01sTMfuxn_b0MgHq4uL2kPN9_j3A",
    "Nawabi Chicken Biryani": "https://lh3.googleusercontent.com/aida-public/AB6AXuDelDKgkWPFwxaAJXnDpWKIaEj65EAX3e6h6yrC2TxQaqmOKA6OxiFN9f4SwrARbjoPnwBlVlQ_2EbYDjs8gguVhu0lu-47LGNEWQl9AATREVqDti9X5Gc-_0bZgfWCsCyVIVddffulPWF4E5qOkp4_bteR1TSiRNxqtePT8a_FaZpK8HLXqo7saZG9OTSn3ZvLdgfz_J58DWSVFkYU-OQhN_JZEr7_bEPOs4NFfsJZy2SsUz2QBrN-UnDVlTWUOfCxpJh7VtsFVOY",
    "Royal Andhra Veg Thali": "https://lh3.googleusercontent.com/aida-public/AB6AXuB6XYjurHzbyxox-5qwanpkD244YwLpHcA8B4EYY-Fj29ocarRa6yC4NpwsKLO6D-aKzf10uQyxpkZwA1bJwxnz3ld4HtoakYEFYVGDn2nYkJ2FPsOb_25zImxFLUNG3d-uNtJfWm6zRnd3N6zwd5sJa4a-O5VguH42jmaVyWSfZG_QI1vkrEVYpzUPuWChnSJHo7z_PFtQUvonCQoSHD3NshHZn8zeJ9MmIuCv8l3nrzvHTU1PkrNCExEhQA4G-crj9wBQ4fw8DDM",
    "Gongura Pachadi": "https://lh3.googleusercontent.com/aida-public/AB6AXuDJlLzuFeHfhraBYRa9vHgz6WXPdvaipcBJpOGjhp5jQGdgJkrbyGFK2-AcfsQZu7meIvLsVlbwPEkBnkrAIDBnn_a4YjE2ssu-aMkjEi-sDDGtDe8CM-IYBz-2qr9IrdTMyegdPGb7boJPkwJwV-AH_Zcoj2cgcghkwwYcB-q5NZ-zA2p9l4-4xE1aar3OqG_dp4pHD6jvf270Eq7j1lwQ8BCBcA-AWmggi-bdktcd2_1E8Vm6u6T01xUsLesY1XcI0-ZJsEZhbno",
    "Dondakaya Fry": "https://lh3.googleusercontent.com/aida-public/AB6AXuBp2jPUv1_LDxkAFqo5ivGqEwVgciS9_raoXiHyOIAHFY6nuOfzp53kYNI_y_kgxUxwH0NqhqzbFoWD0xxEmOsos15-4N2BlSlGeLD8GncJjV51WMlHFrCASAlIISsJuW3Gw8dsWdk7OBYIp0RqbxE9j3UYMYQprtsUn_GULRGD12VAP7MXZzcNUhy-9zEsWT0-GqzEmZ7Ix3AcTiDQTqNc6F8GpNvOFxRk1xSUVfQ3_VujQea2zuspV8I1ZuygugMSkFlOic878go",
    "Lakshmi’s Signature Mutton Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuDhRn13TddDGT4d0h2HdR40gjFbSoQQAU0FafBiMRkl76HtiH6aeVEecOxhIpmPHKLUFdH20yd_uxlyWRoEeVqQw44zm5l29t30Hy9WQsHf5uNjeBRZ5xaXsA5cjcTh67f1cqfRcf9qDIMDSJsevdH3XzZUK1nL2uCBTF-B6pZob3i4ErF3ebguQRn8bPORjDO6hE9ZYhvMEQsXNXfV6YaKNp-ahtIXiQTeqgpLlaLdP3AaHO7kKsKG9QaxLFbH1nO5nzunOvKeQZE",
    "Venkat's Signature Mutton Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuCd-U_pAbGb5kMmbEhqvjgsL6K4JEr5cOXQ1awfNMWMv0Q4fT75pIydl6xddH2M8W9VSmiWobq2NsfuCzExozGETLAp30wFAfMIZ7QmoSsrI_WOJ-fMd_5S-7Fkf96Alf17880FY5tbxU08w-udSm1s9MuRFLupwI88xRn_gVkp30_icwH4T3RzJFR_H3Fa8H81hp7aC0ntUV1PwpXlXHriu761n90Qp3Ddmm5XNvlgHCW8ksl3wLnhgvAhINuiF8QQ697WP7bhXxg",
    "Dal Makhani": "https://lh3.googleusercontent.com/aida-public/AB6AXuDOWZKvV3snB7__kC5JYNzpA84xKE0wlTngsRtIoBa3aK-eTMlFzNG2mBe1UdM3WRDXi60GizQgZP-y8ynEYDW6gX75rKY1yKg0lEr3_ON341Y6dn7VokNsTTKwpT7qRYIneQQVWtNgVF4hQVgH6uogf46I5nGgOpS7FtVooAbeQ2PBhVDHlALxw3Y6npEfpSysSxrVsJNu68Q-wU4LpoLQSbXdu4EGDua56EwQPvqnSci1Iw6P13iwbeHsZvVt5BfovpGZdrZjAZQ",
    "Pindi Chole": "https://lh3.googleusercontent.com/aida-public/AB6AXuB0-GEy4a0IWUdG-GDgim6FoKwA4ol4DUMJRHG1eb-zftnEfQvnXQlLHr1_-Chdsf-Jbwg4XsEIV0Ns2GK8YIXQBf3wubjbFEjkxYi1Af6FGMiBUl4cotMIoZ7_IjGHeVesO33gs1YuL5Egs4gRdVsIr31XshgAVuYxIUb-EcecsVcqqgUKcAmLr1kIaQW-Qyk3eSA3doFVU0CiLQ_oe7WDDgpdxL05ChKjUZPIY5aP6ALXAYslVwuTqi_3l7T7kvBIlSnlEyFBtZw",
    "Stuffed Aloo Paratha": "https://lh3.googleusercontent.com/aida-public/AB6AXuCLJ9-XTZczLtzaUUW7DdRWhJtLinVENNdOx_zUi15SzIyghGQY1qQA32vqV91GJHGVr98FF7KnT2ylLjIznjwaiiOFTCKDzcjrWcsKH41E4l9awU5HIduUrG9r6j018XZpyVn-DiIo6PZtC6mjwEcsbS2e7tT9yQ6iwqMwSPmGFjYEdkh7htvqAyecWGyJ3OPw7HBEqJrNLlp0oCJcp4qiPOeP9wwpgXIZeABjWLlTxGU6n6AgStO0uN_ed0CHdjw2ezxH8H6ul-Q",
    "Paneer Tikka": "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ1gYBKmNfBB0Ijvpw033bjoDj5QRXyESNI5ANafMFA7rfawBn3ySFNq2ko4NLGZzh_S4CoyCF1lNVftmEYGb8QcxeIcrbdIpfGXmi4Ob4oyZLlnlctv4_ShVf2BKYEz8nARdYYRUjpDEIfNrbTU53S07gjsRtFv2ArGDnZA22C30b1clbfbccJUKO-SYbvx9sFalh05pwuO_XiCeFmtfAnFzSuPBNvfpNMBOAxIYhXySzWBf1cU0FzK-keTaBXIk-a8hY-uposu0",
    "Samosa": "https://lh3.googleusercontent.com/aida-public/AB6AXuAyY6htlpCAL6hgcukRgqWMKDwUQjptgdEITxmFKt5NdV-WO7xoyYPREYkaWe6Mb23zk8TY4QSc5tYkWn4jSUORx_elWS6vKVE0X-ymmAeXgZQj1Far-iUTznw6Of0GGjH2SGb3Nj-pqaBKFi8wI2_cV7CqbG1n86BQ_Yb9E02VeYtF8OeSPnHj40sWtrBbqhFiQIeH40N2Q83r5SGVR94EqUhGmrVfsYKG6LTM9VxbpYne1BWz5Nx1kA7fdr1u5S9-FFgFQhGgxxA",
    "Tandoori Roti": "https://lh3.googleusercontent.com/aida-public/AB6AXuCxo1cVXG6JfbwjYh_yz1Idv0NVWx6NZOwgqVrAWjsKw1G_e_hea7pQ_nObLG1mYHhkDW-4g9n6_XFz1pxohWk1jBgE4h_HMtBxhcL9FxlCJ6x5nZ-47xccpaxkX-DmNwH2EH2HqhLSD25Z68H2nEeguNsBHsX5bWEzvHMaXBjDWq0_aC18xlQzfiBiJZ0ZjJt-GsrFirTSiPpWFUKXBfkPspJBP9GeStT0FrwR2zO7eSo3uk0gtNz6ZzI9a3YtDmGJD2VNSykwIHw",
    "Chicken Curry": "https://lh3.googleusercontent.com/aida-public/AB6AXuByDcI1HnMOpS6qTGUjO9At7lBmwLDFlwZXmznbFIc_aU4jC4TkPR7r2NOrAtYriz7fsMW_bE1dt3yXjFDKfaHGv2Kb5SJzhyeCyZjjMKP_cy149xrFdGNzxiTNESeC7ck78ZAvCYm_9bCJYn-u1E1gMiTO71U6Cl2oSEkkcpBTxZWSwPJ5haqwe8DmYSgQltBNF-T4H4hfhzeGJIW3lOMG7w419kTOPQHD_Dm-24W5aH2WvITS6oNuEXzskql1UnoJ4KAsBNrYuuc",
    "Lassi": "https://lh3.googleusercontent.com/aida-public/AB6AXuDjZhE7DzjxEFwYhhFRgKU5Px7RTeBvri40Ym2dCQ81gW_zNglgFPkrz5q8gNfxpsGv2uETiZKFybifWZ1r8JW6VuHgLXmEm4qlrEeehMDRDKoeyPZit8Ty_EccjWIivcFhDiyEjV87eqWwl1BFhF1k11aLR7hfkjZ68vYPJuv97jk3zTNWylrXVZ1N5dONgoG20aSQiVc1Ymoo5YuBCzok_yoaEsvGkvkZsiDAhGw7dU5U0tvsM41aBD4yu-ywU1L0NKXURUtZ7t4",
    "Hyderabadi Chicken Dum Biryani": "https://lh3.googleusercontent.com/aida-public/AB6AXuA02YJpWv1DCUZ4X63SbpMKNomMeMHoObcl_Ya-hNhZRz2ULHv_Ud4bfWAK8hL15AsIsrL3XUndwWIbua7pcp9MDC_qg80Rd_YIxX4S6D4xrvJVYx1ek3dMAXa-eYRbTS1SYZiZadc6LjRDRB7rID845T9hu7jbPZO43ZhCohtAZ6ppM0lFM_GN8zG9t8QEgSDQp-TQ39r4PQ0fcRCoIifXMNUn5IHIv_O0t3oTi_JO-5wSYF9yGJUMXvfEy26txLi8gBhrftiS9pI",
    "Gongura Mutton": "https://lh3.googleusercontent.com/aida-public/AB6AXuA83p9vyu4te_eb5oLX2mTKRkRfJw7ICLG7psqKiNq-N3lQEqzo4c0yLmAeXj9TjBDC3L5wW73kiBk55gaIvodEHs1NRNQwGFawR8-sO3nopzckN6vwUwA-3p9CRWcGXJicGLgv34DDiXh6IPIDmTq3pvSh9UcF7GP1ZGBPtAzbcIQFZPbiWtiqH-fs3QHl63XSwdBAwWpmsJvq8kpROT94X16nGYJjeFByCCXwAUw3fpYR4j-CvFQvjgWb11Cza7OmSmdjKZkIflc",
    "Sarva Pindi": "https://lh3.googleusercontent.com/aida-public/AB6AXuD_zT6EndfFXydcvGfY2faSTsfDQdmczEttxS3mi5I_T_UCz1dy4mjpyDoP5ree0socJShPO6-TKK1OEF4LwOhOnuVpGIIHp58s6YMAqeVq5eGAfcc3AXIWVRrYGRi8_yCcZeGKIFl2ZJP0J_qcsqLn5YEgXhXDVI2T61XPJxDa1AYoP04DFoU_e098-1fElZUcirgyaaZXO90fO65xH3lg0jUym1VcNYjWoTUVLjG-gFKlMTNAOZ4AHg7OXibBZAj5_7sSBqxoG4A",
    "Natu Kodi Pulusu": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "default": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
};


const REGIONS = [
    { name: "Andhra Pradesh", description: "Known for bold spices and rich culinary heritage.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHci6X1DLpnKqU7URaaZMZimwTWHks_K61HaPAJ2a2iaAD8ynh59oWXMgg5ITn2DtrjYjbWDv-1L7LsimSErhml7omXfLeSJb9Inw2_PC2XPuvfbfi26X6g_Ra-HE5N34IhgrXAMb3I7-IIm-ULKnzAWGgDnhzu1wTZg09DJck9_I_MEEABKb4U1n7ZoFrVjwEDbsRwuZyz59uodwcYZONsORZfS7FJ4ZtWkhYHOYs22RD4J-REJxhpRIxTn98JmvUHUX1SXqZ3eE", famousDishes: ["Biryani", "Gongura Chicken"], tags: [{ icon: "local_fire_department", label: "Fiery Spices" }, { icon: "set_meal", label: "Coastal Delicacies" }] },
    { name: "Punjab", description: "Land of butter, wheat, and vibrant flavours.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKOayKb2q5DmpdjihVX3vSx7RQT7gRZb4UmRqR2E6PDw8gC7f9deSYJkcx-MTQhJjxAikSDqNuRnKBp_ObM4yxEIInu0Sr7Fj8NPv4X4n1e5l-jHaxm4t0OWFSWoS6mpYzJeWGD1JozkbDD_W8jM5TYoHlCGVKm_MY57bmrp25Ds67Zf6BkBU8FoZJYYhkFPrNgziR_xgYBJpc1jl5Zd3HhG_1ymtGf3Mh71tHCtQ9gB4VDdhozoqIv9Oj3uDUZnCV5zo-DI0gxPY", famousDishes: ["Butter Chicken", "Sarson Ka Saag"], tags: [{ icon: "breakfast_dining", label: "Tandoori Classics" }, { icon: "local_dining", label: "Dairy-Rich Dishes" }] },
    { name: "Kerala", description: "Coconut-infused curries and spice-route flavours.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQboMU5eQ-_GHBSAD5PNEMQ1edTOVNoerj6ewaop690IkCn4FuntKrp2ZVPSgJyjoyU1hxqlP-5UTd-45bF7W2yYzdpVxr7EUhjw3aLh1zc5KdtV0-GOeDcsf5rR5ae9Y0SAStqoNBe5w7yqNySxErLaTD1WYXUJYW34l6wjpp9b-vddvcMzXpQygxIdKb_NBUMwOXL6ypr-tdZIdEWdvgihKoxyrJtx6TjH0swzbZ8SpbeiKqIIyoPpUcQPWoar70mmyzjUlB4n8", famousDishes: ["Appam", "Fish Curry"], tags: [{ icon: "set_meal", label: "Seafood Specials" }, { icon: "eco", label: "Ayurvedic Touch" }] },
    { name: "Tamil Nadu", description: "Filter coffee, crispy dosas and chettinad masalas.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVRtm80ubthpJOeVjIXqvT1Dx5VmQPFHyzq4P3nMbowCqIZm7vltBRsHBW0dJ4kG50YM2Lh67a26kh_LI0-tILanYcDaLC_fcGitOL2rN4Skqc2--Gp5mMwWcRod8wu8b2dxICyJ7pTBpGLGb8reHEW9iaNGKEOoe9RgP-MvzAf-aimuz9FDTpBlsu3BTX1Y7QXQlBKFvWE_zqT-HjpbOYN5DtOimLob7qD6zOYwuoaqodYGR5edOML1MC9ETnHrE1CFAjrYxoVFE", famousDishes: ["Dosa", "Chettinad Chicken"], tags: [{ icon: "local_cafe", label: "Filter Coffee" }, { icon: "set_meal", label: "Chettinad Delicacies" }] },
    { name: "Rajasthan", description: "Royal kitchens gifted dal baati churma and laal maas.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDmh-Yfim8pqC-czh4zNisVo4aINcS_CfXInFDGJrjaMEOQUYOATp-AxXJbsO6O7gTg5vk1lR0dvtBe-twcZuvIly_dd1_H--zcxxW1fk6YTrK1XMVENwv9iJqCNRps5DsJEb3jHwKAGDbThU8tA4qDGrSzzzd6WPpWoWIfwK95o-PEoSgyXUt8kwqmxJ46_1WwBFXoq7duVwvsvk9DKxoCzaKZP6mZG7El_zmsZVmdopgGcwrwWgBZTheWdDZL_q4tYcKzNbdGcI", famousDishes: ["Dal Baati", "Laal Maas"], tags: [{ icon: "local_fire_department", label: "Laal Maas" }, { icon: "history_edu", label: "Royal Recipes" }] },
    { name: "Gujarat", description: "Vegetarian cuisine bursting with sweetness and spice.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa4IPV8U7PCS3EZ5cO9vw39DwPfp9B_iuqHX0aTfQcXmct44duRHHnocUbz8nN0ziifvWUg0mpSdglNie-LfZDTrFQZxgmqNKmnBsIH08S2eocAEyEde4pGMfCAE9tw-jSdGe4oEWrUWlNVlpfv70lxy1OFX9ghF3zcOJ1JnnU_3qfzDDSACylW7bTC6P6raxTBHA1j37RvBtTNcZUl9S8o6GNeB-bau87q1cslHwNtOKFn1iDTjuOHM3qEHOv7k_hXkNkSQY_3dI", famousDishes: ["Dhokla", "Undhiyu"], tags: [{ icon: "eco", label: "Pure Vegetarian" }, { icon: "local_dining", label: "Thali Feasts" }] },
    { name: "Karnataka", description: "Mysore pak, Bisi Bele Bath and filter coffee culture.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuA06luHJMlu8qA40grs72njVdKLmvBvO6JpidTII8CZGEQdFq--Jskt8Jwu02wF9PBqaOVzd9i7pE6WkEylbntTi_KS4XKsHC2uTTQ5IxWEmOk4PqUFMiu9J_NHA0NKI57P-S-xsZQzFllusAa_qmiOo3JqOPbs8lI4LxXXONcLQdp8WEUHwbCzB-Zq1NlEDuSAIKiqzrTuHjDPfv7gVy8x7JizKW2EU_TZFsoD2X3-YfFNu3iOOCym9JTY-O7K0uYkk-78YGpisFc", famousDishes: ["Bisi Bele Bath", "Mysore Pak"], tags: [{ icon: "local_cafe", label: "Coffee Culture" }, { icon: "eco", label: "Millet Cuisine" }] },
    { name: "Telangana", description: "Hyderabadi biryani and fiery Telangana curries.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOfibWh71T5evJZVCl2Glgy-Dr1tXEKnizrf0SAwjxVImphGJbfcJP7He-ByMBkZt7v50OX6OLf6SF-7ZhAyFg7Sh7DG3tKBSD08IlKmTiqZifJwVL1X0FyfdLCFdMkspmvS9GSULE368bQsDwekCkepqSY2_nMXfsx2LLmnCnZ2Dfg3Z2GBd4V6RGnydstmM7553pqlo9dCEDlBxWxSYgfwU3MYLwYH-QbdNQb_1IDaf_jQ0xpX36QF6308Iq0p6ZFSyDOe2yB5o", famousDishes: ["Hyderabadi Biryani", "Haleem"], tags: [{ icon: "local_fire_department", label: "Spicy Curries" }, { icon: "set_meal", label: "Biryani Capital" }] },
    { name: "West Bengal", description: "Home of Macher Jhol, Rosogolla, and vibrant artistic heritage.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNytZULHsXY5jNOYJjL6b1g-_gS6SXYO44y4HbqvT4OGvL-hm2NlAy3OmeDgA4IMyaoRwH94a7w1dLUIaynUqJgD7y1tyjpt_fBRygLzJRSvqSbnP-VHHWIgrCeMqQugYMne2Dork5f4pP2z0YnLTcWSU8LZZpN3l8z61mGLYPRS7eNxLSkqTQw_qAlCigZa5lfdhtET-WqJw11y4YKNg2_4ffSt3CcTMqqgYGWSKw523arut4jwRu_lGewwa1cVK1MzplNt7RZIE", famousDishes: ["Macher Jhol", "Rosogolla"], tags: [{ icon: "set_meal", label: "Seafood Masterpieces" }, { icon: "icecream", label: "Sweet Delicacies" }] },
    { name: "Maharashtra", description: "Land of vibrant spices, coastal delights, and royal Maharashtrian heritage.", sourceImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuApslgpNOf6TBFR1SqwL6dL_yc7TCDmq9KG3FAcoWKGTS7cJ4DNXsZZorh1bqufGO9hsWMVBqlQy9W2CF3Um8M3m6LmZcgMZvwiOnwrSO5I7Rp6cg6zQdP7CVj8yW3dM3pYCWKXekpGohwprre7KNdOHMi8wgDqQaCVZDa9T8lJFITWfK4aAwoNBPoNAYkhYEXgws3OZr_f2fGVx3BW88ppkrLbLSKTqQ2bXVG0gCldjLWPk4VEEEI5DYImV7_RYVB8YOho2LOGwoE", famousDishes: ["Vada Pav", "Puran Poli"], tags: [{ icon: "local_fire_department", label: "Goda Masala" }, { icon: "set_meal", label: "Konkan Seafood" }] }
];

const CHEF_DATA = {
    "Andhra Pradesh": [
        {
            name: "Chef Lakshmi", city: "Hyderabad", specialty: "Master Chef", bio: "Bringing 30 years of family heritage and authentic Guntur spice to your table. Expert in traditional Thalis and Hyderabadi specialties. My kitchen is a celebration of the rich, bold flavors of Andhra Pradesh, using spices hand-ground in my own kitchen.", experience: "30 Years", dishes: [
                { name: "MLA Pesarattu Upma", category: "Breakfast", foodType: "veg", price: 180, spiceLevel: 1, description: "Green gram crepe served with ginger chutney and savory semolina filling.", orderCount: 165 },
                { name: "Karam Podi Ghee Idli", category: "Breakfast", foodType: "veg", price: 140, spiceLevel: 1, description: "Soft idlis tossed in spicy lentil powder and aromatic pure ghee.", orderCount: 120 },
                { name: "Nawabi Chicken Biryani", category: "Main Course", foodType: "non veg", price: 320, spiceLevel: 3, description: "Authentic dum biryani cooked with marinated chicken and long-grain Basmati.", orderCount: 210 },
                { name: "Royal Andhra Veg Thali", category: "Main Course", foodType: "veg", price: 280, spiceLevel: 2, description: "Pappu, Rasam, Curds, Fry, and Gongura Pickle with unlimited steaming rice.", orderCount: 180 },
                { name: "Gongura Pachadi", category: "Sides & Pickles", foodType: "veg", price: 60, spiceLevel: 2, description: "Tangy sorrel leaves pickled with Guntur chilies.", orderCount: 95 },
                { name: "Dondakaya Fry", category: "Sides & Pickles", foodType: "veg", price: 90, spiceLevel: 1, description: "Crispy ivy gourd fry with peanuts and curry leaves.", orderCount: 85 },
                { name: "Lakshmi’s Signature Mutton Curry", category: "Main Course", foodType: "non veg", price: 420, spiceLevel: 3, description: "Slow-cooked tender mutton in a rich, spicy Guntur chili gravy.", orderCount: 450 }
            ]
        },
        {
            name: "Chef Satyanarayana", city: "East Godavari", specialty: "Godavari Ruchulu — Authentic Andhra Cuisine", bio: "My journey began in the humble home kitchen of our family home in East Godavari. The aroma of roasting spices and the patient art of slow cooking are legacies passed down through generations. Today, Godavari Ruchulu is not just a menu; it's a piece of my heritage shared with every diner.", experience: "15+ Years", dishes: [
                { name: "Nellore Chepala Pulusu", category: "Main Course", foodType: "non veg", price: 420, spiceLevel: 3, description: "Tangy fish curry prepared with traditional tamarind pulp and hand-ground spices from Nellore.", orderCount: 420 },
                { name: "Gongura Mamsam", category: "Main Course", foodType: "non veg", price: 480, spiceLevel: 3, description: "Spicy mutton slow-cooked with fresh sorrel leaves for that unique, earthy tanginess.", orderCount: 380 },
                { name: "Royyala Vepudu", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 3, description: "Crispy prawn fry infused with signature Godavari spices and curry leaves.", orderCount: 450 }
            ]
        }
    ],
    "Punjab": [
        {
            name: "Chef Harpreet Singh", city: "Amritsar", specialty: "Master of Punjabi Cuisine", bio: "Bringing the authentic flavors of Amritsar to your table with three generations of secret family recipes.", experience: "15+ Years", dishes: [
                { name: "Sarson da Saag & Makki di Roti", category: "Main Course", foodType: "veg", price: 349, spiceLevel: 1, description: "Hand-churned mustard greens (saag) cooked slowly with traditional spices, served with golden cornmeal flatbread (makki di roti), a dollop of white butter, and spicy jaggery.", orderCount: 320 },
                { name: "Classic Butter Chicken", category: "Main Course", foodType: "non veg", price: 425, spiceLevel: 2, description: "Tender chicken pieces simmered in a rich, velvety tomato and cream gravy with aromatic dried fenugreek.", orderCount: 450 },
                { name: "Amritsari Kulcha", category: "Breakfast", foodType: "veg", price: 245, spiceLevel: 1, description: "Crispy, flaky tandoor-baked flatbread stuffed with spiced potatoes and served with spicy chickpeas.", orderCount: 280 },
                { name: "Dal Makhani", category: "Main Course", foodType: "veg", price: 315, spiceLevel: 1, description: "Black lentils slow-cooked overnight with cream, butter, and smoked spices for an unmatched depth of flavor.", orderCount: 390 }
            ]
        },
        {
            name: "Chef Gurpreet", city: "Ludhiana", specialty: "Authentic Rural Punjabi Specialist", bio: "With over 10 years of experience, specializing in traditional village flavors and charcoal-cooked classics.", experience: "10+ Years", dishes: [
                { name: "Dal Makhani", category: "Main Course", foodType: "veg", price: 340, spiceLevel: 1, description: "Slow-cooked for 12 hours over charcoal for that authentic smoky village flavor.", orderCount: 210 },
                { name: "Pindi Chole", category: "Main Course", foodType: "veg", price: 280, spiceLevel: 2, description: "Dry chickpeas cooked with Rawalpindi spices and tang of dried pomegranate seeds.", orderCount: 180 },
                { name: "Stuffed Aloo Paratha", category: "Breakfast", foodType: "veg", price: 160, spiceLevel: 1, description: "Whole wheat flatbread stuffed with spiced potatoes, served with homemade white butter.", orderCount: 150 }
            ]
        }
    ],
    "Kerala": [
        {
            name: "Chef Mariyam", city: "Kochi", specialty: "Malabar Coastal Kitchen", bio: "Expert in Authentic Moplah & Coastal Cuisine, bringing the soul of Kerala's shores to your table.", experience: "18+ Years", dishes: [
                { name: "Kerala Fish Curry", category: "Main Course", foodType: "non veg", price: 350, spiceLevel: 2, description: "A spicy and tangy Malabar specialty made with fresh catch, Kudampuli (Malabar tamarind), and a secret blend of roasted spices.", orderCount: 220 },
                { name: "Puttu & Kadala Curry", category: "Breakfast", foodType: "veg", price: 180, spiceLevel: 1, description: "Steamed cylinders of ground rice layered with coconut, served with a spicy black chickpeas curry.", orderCount: 150 },
                { name: "Appam & Veg Stew", category: "Breakfast", foodType: "veg", price: 220, spiceLevel: 1, description: "Lacy rice pancakes with a soft center, served with aromatic coconut milk vegetable stew.", orderCount: 180 },
                { name: "Malabar Prawn Roast", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 2, description: "Succulent prawns slow-roasted in a thick, spicy gravy with shallots, coconut slices and curry leaves.", orderCount: 210 }
            ]
        },
        {
            name: "Chef Madhavan", city: "Trivandrum", specialty: "Backwater Spice Master", bio: "Expert in Authentic Kerala Cuisine & Seafood. Bringing the festive flavors of backwater kitchens to your daily meal.", experience: "25+ Years", dishes: [
                { name: "Karimeen Pollichathu", category: "Main Course", foodType: "non veg", price: 850, spiceLevel: 2, description: "Pearl Spot Fish marinated in traditional Kerala spices, slow-grilled in a banana leaf for an authentic smoky flavor.", orderCount: 120 },
                { name: "Beef Ularthiyathu", category: "Main Course", foodType: "non veg", price: 420, spiceLevel: 3, description: "Succulent beef cubes slow-roasted with coconut slivers, curry leaves, and traditional Kerala spices.", orderCount: 190 },
                { name: "Parotta & Chicken", category: "Main Course", foodType: "non veg", price: 350, spiceLevel: 2, description: "Multi-layered flaky flatbread served with aromatic Kerala style chicken curry.", orderCount: 310 },
                { name: "Banana Fritters", category: "Snacks", foodType: "veg", price: 120, spiceLevel: 0, description: "Golden fried ripe banana fritters, a classic Kerala tea-time favorite.", orderCount: 250 }
            ]
        }
    ],
    "Tamil Nadu": [
        {
            name: "Chef Meenakshi", city: "Madurai", specialty: "Traditional Chettinad & Madurai Flavors", bio: "Bringing the authentic essence of South Indian heritage to your table. Every spice is hand-ground, and every recipe is a legacy passed down through generations. Experience the soul of Madurai.", experience: "25+ Years", dishes: [
                { name: "Chettinad Chicken Curry", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 3, description: "A legendary pepper-based curry made with 18 different hand-roasted spices. This dark, rich, and aromatic gravy is slow-cooked to perfection.", orderCount: 420 },
                { name: "Chicken 65", category: "Snacks", foodType: "non veg", price: 320, spiceLevel: 2, description: "Authentic spicy fried chicken with hand-ground masalas.", orderCount: 310 },
                { name: "Madurai Bun Parotta", category: "Main Course", foodType: "non veg", price: 60, spiceLevel: 1, description: "Unique thick, soft, and flaky layered bread. A Madurai specialty.", orderCount: 550 },
                { name: "Filter Coffee", category: "Beverages", foodType: "veg", price: 95, spiceLevel: 0, description: "Traditional degree coffee served in a brass tumbler.", orderCount: 600 }
            ]
        },
        {
            name: "Chef Karthik", city: "Tanjavur", specialty: "Master of Kongu Nadu & Tanjavur Heritage", bio: "Bringing the authentic soul of Kongu Nadu & Tanjavur to your table. Preserving the rich culinary heritage through traditional recipes and organic ingredients.", experience: "25 Years", dishes: [
                { name: "Tanjavur Maratha Mutton Curry", category: "Main Course", foodType: "non veg", price: 480, spiceLevel: 3, description: "A legendary recipe from the Royal Maratha kitchens of Tanjavur. Prepared with hand-pounded spices and slow-cooked to perfection.", orderCount: 380 },
                { name: "Kongu Mutton Biryani", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 2, description: "The iconic Seeraga Samba rice biryani. Light on the stomach, high on aroma, featuring tender pieces of meat and local spices.", orderCount: 520 },
                { name: "Karupatti Halwa", category: "Desserts", foodType: "veg", price: 180, spiceLevel: 0, description: "Nutritious and decadent traditional dessert made with palm jaggery, whole wheat, and crunchy cashew nuts.", orderCount: 290 }
            ]
        }
    ],
    "Rajasthan": [
        {
            name: "Chef Bhanwar Singh", city: "Jaipur", specialty: "Master of Rajputana Heritage & Royal Flavors", bio: "Carrying forward the 300-year-old culinary secrets of the Mewar royal kitchens, specializing in slow-cooked game meats and desert delicacies.", experience: "30+ Years", dishes: [
                { name: "Authentic Rajasthani Laal Maas", category: "Main Course", foodType: "non veg", price: 550, spiceLevel: 3, description: "A legendary slow-cooked mutton curry prepared with a paste of fiery Mathania chillies and smoked with charcoal.", orderCount: 450 },
                { name: "Ker Sangri", category: "Main Course", foodType: "veg", price: 320, spiceLevel: 2, description: "Traditional desert beans and berries cooked with dried mango, cumin, and local spices.", orderCount: 280 },
                { name: "Gatte ki Sabzi", category: "Main Course", foodType: "veg", price: 280, spiceLevel: 2, description: "Gram flour dumplings simmered in a tangy, spiced yogurt-based gravy.", orderCount: 310 },
                { name: "Bajre ki Roti with Lehsun Chutney", category: "Sides & Pickles", foodType: "veg", price: 120, spiceLevel: 3, description: "Hand-rolled pearl millet flatbread served with fiery, hand-pounded garlic & red chili dip.", orderCount: 520 }
            ]
        },
        {
            name: "Chef Shanti Devi", city: "Jodhpur", specialty: "Authentic Marwari 'Thali' Specialist", bio: "Authentic Marwari 'Thali' Specialist with 25+ years of experience. Bringing the true taste of Marwari culture to your daily meal.", experience: "25+ Years", dishes: [
                { name: "Panchmel Dal Baati Churma", category: "Main Course", foodType: "veg", price: 450, spiceLevel: 2, description: "The quintessential Rajasthani meal. Five-lentil dal served with golden-baked baatis and sweet wheat churma, topped with pure desi ghee.", orderCount: 680 },
                { name: "Mirchi Bada", category: "Snacks", foodType: "veg", price: 80, spiceLevel: 2, description: "Large spicy green chillies stuffed with potato and deep-fried in gram flour batter.", orderCount: 420 },
                { name: "Papad ki Sabzi", category: "Main Course", foodType: "veg", price: 220, spiceLevel: 2, description: "A unique Marwari curry made with roasted papads in a spicy yogurt base.", orderCount: 350 },
                { name: "Mawa Kachori", category: "Desserts", foodType: "veg", price: 150, spiceLevel: 0, description: "A sweet, deep-fried pastry filled with khoya and nuts, dipped in saffron sugar syrup.", orderCount: 290 }
            ]
        }
    ],
    "Gujarat": [
        {
            name: "Chef Hansaben", city: "Rajkot", specialty: "Authentic Kathiyawadi Specialist", bio: "Born and raised in the heart of Kathiyawad, Hansaben brings over three decades of culinary wisdom. Her recipes are a tribute to the sun-soaked fields of Gujarat.", experience: "35+ Yrs", dishes: [
                { name: "Kathiyawadi Akha Adad & Bajra No Rotlo", category: "Main Course", foodType: "veg", price: 350, spiceLevel: 2, description: "Whole black gram slow-cooked for 8 hours with secret Saurashtra spices, served with hand-patted millet flatbread.", orderCount: 410 },
                { name: "Nylon Dhokla", category: "Snacks", foodType: "veg", price: 180, spiceLevel: 1, description: "Cloud-like fermented chickpea sponges, tempered with green chillies and curry leaves.", orderCount: 520 },
                { name: "Surti Khandvi", category: "Snacks", foodType: "veg", price: 220, spiceLevel: 1, description: "Silky, savory gram flour rolls delicately tempered with coconut and fresh coriander.", orderCount: 380 },
                { name: "Vagharelo Rotlo", category: "Main Course", foodType: "veg", price: 240, spiceLevel: 2, description: "The ultimate comfort food - bajra flatbread sautéed with buttermilk, garlic, and red chilies.", orderCount: 290 }
            ]
        },
        {
            name: "Chef Praful", city: "Ahmedabad", specialty: "Master of Classic Gujarati Thali", bio: "Master of Classic Gujarati Thali. 15 Years Exp. Authentic Taste • High Hygiene Standards.", experience: "15 Years", dishes: [
                { name: "Premium Gujarati Thali", category: "Main Course", foodType: "veg", price: 449, spiceLevel: 1, description: "Experience a symphony of flavors including seasonal Aamras, slow-cooked Undhiyu, and decadent Shrikhand.", orderCount: 750 },
                { name: "Thepla with Chunda", category: "Breakfast", foodType: "veg", price: 180, spiceLevel: 1, description: "Fenugreek flatbreads with homemade mango pickle.", orderCount: 420 },
                { name: "Fafda Jalebi", category: "Breakfast", foodType: "veg", price: 220, spiceLevel: 1, description: "The classic Sunday morning duo, served fresh.", orderCount: 610 },
                { name: "Gujarati Dal", category: "Main Course", foodType: "veg", price: 150, spiceLevel: 1, description: "Sweet, sour and spicy lentil soup - a home favorite.", orderCount: 340 }
            ]
        }
    ],
    "Karnataka": [
        {
            name: "Chef Preeti", city: "Madikeri", specialty: "Coorg & Karavali Specialist", bio: "Coorg & Karavali Specialist. 15+ years of culinary excellence. Experience the rich, bold flavors of Karnataka heritage.", experience: "15+ Years", dishes: [
                { name: "Coorgi Pandi Curry with Kadambuttu", category: "Main Course", foodType: "non veg", price: 520, spiceLevel: 3, description: "A rich, dark spicy pork curry seasoned with unique 'Kachampuli' (black vinegar) served with steamed rice balls.", orderCount: 820 },
                { name: "Mangalorean Fish Curry", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 3, description: "Kane (Lady Fish) cooked in a tangy coconut-based gravy with Byadgi chillies.", orderCount: 480 },
                { name: "Neer Dosa & Chicken Ghee Roast", category: "Main Course", foodType: "non veg", price: 380, spiceLevel: 3, description: "Paper-thin rice crepes served with succulent chicken pieces roasted in pure ghee and spices.", orderCount: 1200 },
                { name: "Kori Rotti", category: "Main Course", foodType: "non veg", price: 320, spiceLevel: 2, description: "A Tulu classic: spicy chicken curry poured over thin, crisp rice wafers that soften beautifully.", orderCount: 650 }
            ]
        },
        {
            name: "Chef Mallamma", city: "Bagalkot", specialty: "North Karnataka (Uttara Karnataka) Specialist", bio: "North Karnataka (Uttara Karnataka) Specialist from Bagalkot Region. 18+ Years of Culinary Heritage. Every recipe has been passed down through three generations of my family.", experience: "18+ Years", dishes: [
                { name: "Jolada Rotti & Ennegayi (Brinjal Curry)", category: "Main Course", foodType: "veg", price: 240, spiceLevel: 2, description: "Hand-patted sorghum flatbread served with stuffed spicy eggplant curry, a signature staple of North Karnataka.", orderCount: 510 },
                { name: "Shenga Holige (Peanut Puran Poli)", category: "Desserts", foodType: "veg", price: 120, spiceLevel: 0, description: "Sweet flatbread stuffed with roasted peanuts and jaggery.", orderCount: 380 },
                { name: "Girmit (Spicy Puffed Rice)", category: "Snacks", foodType: "veg", price: 80, spiceLevel: 2, description: "Classic Hubballi-Dharwad street snack with roasted spices.", orderCount: 920 },
                { name: "Dharwad Peda", category: "Desserts", foodType: "veg", price: 150, spiceLevel: 0, description: "The legendary milk sweet from Dharwad, slow-cooked to perfection.", orderCount: 1500 }
            ]
        }
    ],
    "Telangana": [
        {
            name: "Chef Sujata", city: "Hyderabad", specialty: "Telangana Specialist", bio: "Bringing the authentic spices and age-old secrets of Telangana home cooking to your table. Every dish is a story of heritage and flavor.", experience: "15 Years", dishes: [
                { name: "Sarva Pindi", category: "Breakfast", foodType: "veg", price: 120, spiceLevel: 1, description: "Spicy savory pancake made with rice flour, chana dal, and peanuts. A classic Telangana breakfast favorite.", orderCount: 310 },
                { name: "Natu Kodi Pulusu", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 3, description: "Traditional country chicken curry cooked slow with village spices and a robust tamarind base.", orderCount: 280 },
                { name: "Gongura Mutton", category: "Main Course", foodType: "non veg", price: 520, spiceLevel: 2, description: "Signature tangy and spicy mutton curry slow-cooked with fresh sorrel leaves (Gongura) and Guntur chillies.", orderCount: 420 }
            ]
        },
        {
            name: "Chef Rajayya", city: "Hyderabad", specialty: "Authentic Nizami & Telangana Master", bio: "Specializing in rural Telangana flavors and royal Hyderabadi cuisine. Bringing the festive flavors of Nizami kitchens to your daily meal.", experience: "25+ Years", dishes: [
                { name: "Hyderabadi Chicken Dum Biryani", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 2, description: "Fragrant long-grain basmati rice layered with succulent marinated chicken and exotic spices.", orderCount: 550 },
                { name: "Gongura Mutton", category: "Main Course", foodType: "non veg", price: 520, spiceLevel: 3, description: "A spicy and tangy specialty of the Telangana region featuring tender mutton slow-cooked with sorrel leaves.", orderCount: 480 },
                { name: "Sarva Pindi", category: "Breakfast", foodType: "veg", price: 180, spiceLevel: 1, description: "A savory, spicy rice-flour pancake with peanuts and lentils. A traditional rural Telangana breakfast classic.", orderCount: 220 }
            ]
        }
    ],
    "West Bengal": [
        {
            name: "Chef Debarati", city: "Kolkata", specialty: "Authentic Bengali 'Bari' Cuisine Master", bio: "Bringing the traditional flavors of Kolkata and rural Bengal to your table, prepared with heritage recipes passed down through generations.", experience: "15+ Years", dishes: [
                { name: "Shorshe Ilish", category: "Main Course", foodType: "non veg", price: 580, spiceLevel: 2, description: "Fresh Hilsa fish slow-cooked in a pungent and creamy mustard paste with green chilies. A quintessential Bengali masterpiece.", orderCount: 310 },
                { name: "Kosha Mangso", category: "Main Course", foodType: "non veg", price: 450, spiceLevel: 3, description: "Slow-cooked spicy mutton curry featuring a rich, dark gravy and tender meat chunks.", orderCount: 220 },
                { name: "Luchi & Cholar Dal", category: "Breakfast", foodType: "veg", price: 180, spiceLevel: 1, description: "Deep-fried puffed bread served with a traditional sweet and savory Bengal gram lentil curry.", orderCount: 180 },
                { name: "Mishti Doi", category: "Desserts", foodType: "veg", price: 120, spiceLevel: 0, description: "Classic Bengali sweetened yogurt fermented in clay pots for an authentic earthy flavor.", orderCount: 250 }
            ]
        },
        {
            name: "Chef Anirban", city: "Kolkata", specialty: "Master of Traditional Bengali Seafood & Curries", bio: "Expert in Malai Curry and regional fish specialties from the coastal regions of West Bengal. Bringing authentic home-style flavors to your table with recipes passed down through generations.", experience: "12+ Years", dishes: [
                { name: "Chingri Malai Curry", category: "Main Course", foodType: "non veg", price: 520, spiceLevel: 2, description: "Prawn Malai Curry cooked in a rich, creamy coconut milk gravy with subtle spices. A signature Bengali delicacy.", orderCount: 410 },
                { name: "Bhetki Pathuri", category: "Main Course", foodType: "non veg", price: 380, spiceLevel: 2, description: "Tender Bhetki fish fillets marinated in mustard paste and steamed to perfection inside banana leaves.", orderCount: 280 },
                { name: "Dhokar Dalna", category: "Main Course", foodType: "veg", price: 220, spiceLevel: 1, description: "Savory fried lentil cakes simmered in a light cumin and ginger based gravy.", orderCount: 190 },
                { name: "Baigun Bhaja", category: "Sides & Pickles", foodType: "veg", price: 90, spiceLevel: 1, description: "Thick slices of eggplant rubbed with turmeric and salt, shallow fried to a golden crisp.", orderCount: 350 }
            ]
        }
    ],
    "Maharashtra": [
        {
            name: "Chef Sunita", city: "Pune", specialty: "Authentic Maharashtrian 'Purnagad' Specialist", bio: "Preserving the rich culinary heritage of Maharashtra through traditional slow-cooking techniques and hand-ground spice blends.", experience: "15+ Years", dishes: [
                { name: "Puran Poli with Katachi Amti", category: "Main Course", foodType: "veg", price: 350, spiceLevel: 1, description: "Sweet flatbread stuffed with chana dal and jaggery, served with a spicy, tangy tempered dal liquor. A festive Maharashtrian classic.", orderCount: 420 },
                { name: "Puneri Misal Pav", category: "Snacks", foodType: "veg", price: 180, spiceLevel: 3, description: "Spiced sprout curry topped with farsan, onions, and lemon.", orderCount: 550 },
                { name: "Bharli Vangi", category: "Main Course", foodType: "veg", price: 240, spiceLevel: 2, description: "Baby eggplants stuffed with a spicy peanut and coconut masala.", orderCount: 310 }
            ]
        },
        {
            name: "Chef Gauri", city: "Nagpur", specialty: "Master of Spicy Saoji & Vidarbha Traditions", bio: "Master of Spicy Saoji & Vidarbha Traditions. 12+ years of culinary excellence in authentic Maharastrian heritage.", experience: "12+ Years", dishes: [
                { name: "Saoji Chicken Curry", category: "Main Course", foodType: "non veg", price: 480, spiceLevel: 3, description: "A fiery and aromatic traditional slow-cooked chicken curry from the heart of Vidarbha, made with 32 hand-ground spices.", orderCount: 410 },
                { name: "Varadi Thecha with Bhakri", category: "Sides & Pickles", foodType: "veg", price: 120, spiceLevel: 3, description: "Smoky green chili and garlic paste served with hot, soft jowar flatbread.", orderCount: 280 },
                { name: "Pithla Bhakri", category: "Main Course", foodType: "veg", price: 150, spiceLevel: 1, description: "Traditional gram flour porridge tempered with spices, served with fresh bhakri.", orderCount: 190 },
                { name: "Patodi Rassa", category: "Main Course", foodType: "veg", price: 220, spiceLevel: 3, description: "Gram flour cakes simmered in a piping hot, spicy Nagpuri gravy.", orderCount: 350 }
            ]
        }
    ]
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB for seeding...\n");

        // 0. Clean up old seeded data
        console.log("🧹 Cleaning old seeded data...");
        const oldChefs = await chef.find({});
        for (const ch of oldChefs) {
            await Item.deleteMany({ shop: ch._id });
        }
        await chef.deleteMany({});
        await Region.deleteMany({});
        await User.deleteMany({ email: /@maakhana\.com$/ });
        console.log(`  Removed ${oldChefs.length} old chefs, their items, old regions, and seeded user accounts.\n`);

        // 1. Seed Regions — upload images to Cloudinary
        console.log("📍 Seeding regions with Cloudinary images...");
        for (const r of REGIONS) {
            console.log(`  Region: ${r.name}`);
            const cloudUrl = await uploadToCloudinary(r.sourceImg, "regions");
            const { sourceImg, ...regionData } = r;
            regionData.image = cloudUrl;
            await Region.findOneAndUpdate({ name: r.name }, regionData, { upsert: true, new: true });
        }
        console.log(`✅ ${REGIONS.length} regions seeded\n`);

        // 2. Seed Chefs + Dishes — upload images to Cloudinary
        const hashedPw = await bcrypt.hash("chef12345", 10);
        let totalChefs = 0, totalDishes = 0;

        for (const [stateName, chefs] of Object.entries(CHEF_DATA)) {
            let chefIdx = 0;
            for (const c of chefs) {
                chefIdx++;
                console.log(`👨‍🍳 Chef: ${c.name} (${stateName})`);
                const email = `${c.name.toLowerCase().replace(/[^a-z]/g, "")}@maakhana.com`;
                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({ fullName: c.name, email, password: hashedPw, role: "HomeCook" });
                }

                // Look up region-specific chef image
                const imgKey = `${stateName}_${chefIdx}`;
                const chefSourceImg = CHEF_IMAGES[imgKey] || CHEF_IMAGES[`${stateName}_1`] || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop";
                console.log(`  📸 Using image: ${imgKey}`);

                const chefCloudUrl = await uploadToCloudinary(chefSourceImg, "chefs");
                const isPureVegCalculated = c.dishes.every(d => d.foodType === "veg");

                let shop = await chef.findOne({ homechef: user._id });
                if (shop) {
                    shop.image = chefCloudUrl;
                    shop.isPureVeg = isPureVegCalculated;
                    await shop.save();
                } else {
                    shop = await chef.create({
                        name: c.name, city: c.city, state: stateName, address: `${c.city}, ${stateName}`,
                        bio: c.bio, specialty: c.specialty, experience: c.experience,
                        homechef: user._id, rating: { average: 3.5 + Math.random() * 1.5, count: Math.floor(20 + Math.random() * 100) },
                        mealsServed: Math.floor(50 + Math.random() * 500), image: chefCloudUrl,
                        isPureVeg: isPureVegCalculated
                    });
                }

                for (const d of c.dishes) {
                    console.log(`    🍛 Dish: ${d.name}`);
                    const dishSourceImg = DISH_SOURCE_IMGS[d.name] || DISH_SOURCE_IMGS.default;
                    const dishCloudUrl = await uploadToCloudinary(dishSourceImg, "dishes");

                    let item = await Item.findOne({ name: d.name, shop: shop._id });
                    if (item) {
                        item.image = dishCloudUrl;
                        await item.save();
                    } else {
                        item = await Item.create({
                            ...d, shop: shop._id, image: dishCloudUrl,
                            rating: { average: 3.5 + Math.random() * 1.5, count: Math.floor(10 + Math.random() * 80) }
                        });
                        shop.items.push(item._id);
                    }
                    totalDishes++;
                }
                await shop.save();
                totalChefs++;
            }
        }
        console.log(`\n✅ ${totalChefs} chefs with Cloudinary images`);
        console.log(`✅ ${totalDishes} dishes with Cloudinary images`);
        console.log("🎉 Seeding complete — all images stored in Cloudinary!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();
