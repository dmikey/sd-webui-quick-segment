# Quick Body Mask for Stable Diffusion WebUI

**Simplified fork focusing on quick body part masking using SAM (Segment Anything Model) and GroundingDINO.**

This extension provides an easy-to-use interface for detecting and masking body parts, clothing, and faces using AI-powered segmentation. Perfect for creating masks to use with img2img inpainting or other image editing workflows.

## Features

- **🎯 Quick Body Part Detection** - One-click detection of:
  - Full body, upper/lower body
  - Face and facial features
  - Hands and feet
  - Clothing items (shirts, pants, dresses, etc.)
  - Custom object detection via text prompts

- **🤖 AI-Powered Segmentation** - Uses state-of-the-art models:
  - SAM (Segment Anything Model) for precise mask generation
  - GroundingDINO for text-based object detection
  - Multiple SAM model options (standard, HQ, mobile)

- **⚡ Simple Workflow**:
  1. Upload your image
  2. Select a preset (or enter custom prompt)
  3. Adjust detection threshold
  4. Click "Generate Body Mask"
  5. View results: Preview | Mask | Cutout for each detection
  6. Right-click to save individual masks

- **🎨 Mask Customization**:
  - Adjustable detection threshold
  - Mask expansion/dilation
  - Combined mask option for multiple detections
  - Separate mask output for each detected region

## How to Use

1. **Open the extension** in txt2img or img2img tabs (look for "Quick Body Mask" accordion)
2. **Select SAM model** from the dropdown (will auto-download if not present)
3. **Upload your image**
4. **Choose a preset** from the dropdown:
   - Full Body, Upper/Lower Body
   - Face, Eyes, Nose, Mouth, Ears
   - Hands, Feet
   - Shirts, Pants, Dress, Shoes
   - Or select "Custom" to enter your own text prompt
5. **Adjust settings** (optional):
   - Detection Threshold: Lower = more detections, Higher = stricter
   - Mask Expansion: Expand mask edges (5-15 pixels recommended)
   - Also Show Combined Mask: Adds an option to combine all detected regions
6. **Click "Generate Body Mask"** and wait for results
7. **View results** in the gallery:
   - Each row shows: [Preview | Mask | Cutout] for each detection
   - White areas in mask = selected region
   - Cutout = extracted region with transparent background
8. **Save masks**: Right-click on any image in the gallery to save it

## FAQ

1. Due to the overwhelming complaints about GroundingDINO installation and the lack of substitution of similar high-performance text-to-bounding-box library, I decide to modify the source code of GroundingDINO and push to this repository. **Starting from [v1.5.0](https://github.com/continue-revolution/sd-webui-segment-anything/releases/tag/v1.5.0), you can choose to use local GroundingDINO by checking `Use local groundingdino to bypass C++ problem` on `Settings/Segment Anything`.** This change should solve all problems about ninja, pycocotools, _C and any other problems related to C++/CUDA compilation.

    If you did not modify the setting described above, This script will firstly try to install GroundingDINO and check if your environment has successfully built the C++ dynamic library (the annoying `_C`). If so, this script will use the official implementation of GroundingDINO. This is to show respect to the authors of GroundingDINO. If the script failed to install GroundingDINO, it will use local GroundingDINO instead.

    If you'd still like to resolve the install problem of GroundingDINO, I observe some common problems for Windows users:
    - `pycocotool`: [here](https://github.com/cocodataset/cocoapi/issues/415#issuecomment-627313816).
    - `_C`: [here](https://github.com/continue-revolution/sd-webui-segment-anything/issues/32#issuecomment-1513873296). DO NOT skip steps.

    If you are still unable to install GroundingDINO on Windows AND you cannot resolve this problem AFTER searching for issues inside [here](https://github.com/continue-revolution/sd-webui-segment-anything/issues) [here](https://github.com/IDEA-Research/Grounded-Segment-Anything/issues) and [here](https://github.com/IDEA-Research/GroundingDINO/issues), You may refer to [#98](https://github.com/continue-revolution/sd-webui-segment-anything/issues/98) and watch the videos there. Note that I develop on linux, so I cannot guarantee that any video tutorials may or may not work.

2.  If you 
    - cannot use ControlNet/WebUI after installing this extension even when you are/are not using this extension
    - observe problems like [AttributeError: 'bool' object has no attribute 'enabled'](https://github.com/continue-revolution/sd-webui-segment-anything/issues/106) and [TypeError: 'bool' object is not subscriptable](https://github.com/continue-revolution/sd-webui-segment-anything/issues/93) from ControlNet
    - when you disable SAM extension, the problem disappear
    
    The problem is most likely due to some other extensions which might also change the position inside the extension list to control ControlNet. The easiest solution is [here](https://github.com/continue-revolution/sd-webui-segment-anything/issues/93#issuecomment-1546777860). This change will precede SAM extension to be before ControlNet, bypassing the internal preceding code, and will not prevent you from receiving any updates from me. I am not planning to refactor my code to bypass this problem. I did not expect to control ControlNet when I created this extension, but ControlNet indeed grow much faster than my expectation.

3. This extension has almost moved into maintenance phase. Although I don't think there will be huge updates in the foreseeable future, Mikubill ControlNet Extension is still fast developing, and I'm looking forward to more opportunities to connect my extension to ControlNet. Despite of this, I will continue to deal with issues, and monitor new research works to see if they are worth supporting. I welcome any community contribution and any feature requests.

4. You must use gradio>=3.23.0 and WebUI>=`22bcc7be` to use this extension. A1111 WebUI is stable, and some integrated package authors have also updated their packages (for example, if you are using the package from [@Akegarasu](https://github.com/Akegarasu), i.e. 秋叶整合包, it has already been updated according to [this video](https://www.bilibili.com/video/BV1iM4y1y7oA)). Also, supporting different versions of WebUI will be a huge time commitment, during which I can create many more features. Please update your WebUI and it is safe to use. I'm not planning to support some old commits of WebUI, such as `a9fed7c3`.

5. It is impossible to support the following features, at least at this moment, due to gradio/A1111 limitations. I will closely monitor gradio/A1111 update to see if it becomes possible to support them:
    - [color inpainting](https://github.com/continue-revolution/sd-webui-segment-anything/issues/22), because gradio wierdly enlarge the input image which slows down your browser, or even freeze your page. I have already implemented this feature, though, but I made it invisible. Note that ControlNet v1.1 inpainting model is very strong, and you do not need to rely on the traditional inpainting anymore. ControlNet v1.1 does not support color inpainting.
    - edit mask/explicit copy, because gradio [Image](https://gradio.app/docs/#image) component cannot accept image+mask as an output, which is the required way of explicitly copying a masked image to img2img inpaint/inpaint sketch/ControlNet (i.e. you can see the actual masked image on the panel, instead of a mysterious internal copying). Without this, you will not be able to edit mask.

6. [Inpaint-Anything](https://github.com/geekyutao/Inpaint-Anything) and [EditAnything](https://github.com/sail-sg/EditAnything) and A LOT of other popular SAM extensions have been supported. For Inpaint-Anything, you may check [this issue](https://github.com/continue-revolution/sd-webui-segment-anything/issues/60) for how to use. For EditAnything, please check [how to use](#controlnet). I am always open to support any other interesting applications, submit a feature request if you find another interesting one.

7. If you have a job opportunity and think I am a good fit, please feel free to send me an email.

8. If you want to sponsor me, please go to [sponsor](#sponsor) section and scan the corresponding QR code.

## Installation

Download this extension to `${sd-webui}/extensions` via whatever way you like (git clone or install from UI)

Choose one or more of the models below and put them to `${sd-webui}/models/sam` or `${sd-webui-segment-anything}/models/sam` (Choose one, not both. Remove the former folder if you choose to use the latter.). **Do not change model name, otherwise this extension may fail due to a bug inside segment anything.**

We support several variations of segmentation models:

1. [SAM](https://github.com/facebookresearch/segment-anything) from Meta AI.
    - [2.56GB sam_vit_h](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth)
    - [1.25GB sam_vit_l](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_l_0b3195.pth)
    - [375MB sam_vit_b](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth)
    
    I myself tested vit_h on NVIDIA 3090 Ti which is good. If you encounter VRAM problem, you should switch to smaller models.

2. [SAM-HQ](https://github.com/SysCV/sam-hq) from SysCV.
    - [2.57GB sam_hq_vit_h](https://huggingface.co/lkeab/hq-sam/resolve/main/sam_hq_vit_h.pth)
    - [1.25GB sam_hq_vit_l](https://huggingface.co/lkeab/hq-sam/resolve/main/sam_hq_vit_l.pth)
    - [379MB sam_hq_vit_b](https://huggingface.co/lkeab/hq-sam/resolve/main/sam_hq_vit_b.pth)

3. [MobileSAM](https://github.com/ChaoningZhang/MobileSAM) from Kyung Hee University.
    - [39MB mobile_sam](https://github.com/ChaoningZhang/MobileSAM/blob/master/weights/mobile_sam.pt)

We plan to (**NOT supported yet**) support some other variations of segmentation models after a major refactor of the codebase:

4. [Matting-Anything](https://github.com/SHI-Labs/Matting-Anything) from SHI-Labs. This is a post-processing model for any variation of SAM. Put the model under `${sd-webui-segment-anything}/models/sam`
    - [11MB mam](https://huggingface.co/conrevo/SAM4WebUI-Extension-Models/resolve/main/mam.pth)

5. [FastSAM](https://github.com/CASIA-IVA-Lab/FastSAM) from CASIA-IVA-Lab. This is a YOLO variation of SAM.
    - [145MB FastSAM-x](https://huggingface.co/conrevo/SAM4WebUI-Extension-Models/resolve/main/FastSAM-x.pt)

GroundingDINO packages, GroundingDINO models and ControlNet annotator models will be automatically installed the first time you use them. 

If your network does not allow you to access huggingface via the terminal, download GroundingDINO models from [huggingface](https://huggingface.co/ShilongLiu/GroundingDINO/tree/main) and put them under `${sd-webui-segment-anything}/models/grounding-dino`. Please note that GroundingDINO still need to access huggingface to download bert vocabularies. There is no alternative at this time. Read [here](https://github.com/continue-revolution/sd-webui-segment-anything/issues/138) to find a way to resolve this problem. I will try to find an alternative in the near future.

## Troubleshooting

**GroundingDINO Installation Issues:**
- This extension uses local GroundingDINO by default to avoid C++/CUDA compilation issues
- If you encounter errors, go to Settings → Segment Anything → Enable "Use local groundingdino"
- Models are auto-downloaded from HuggingFace on first use

**MPS/Apple Silicon Issues:**
- If you encounter MPS errors on Mac, try launching with: `export PYTORCH_ENABLE_MPS_FALLBACK=1`
- Or enable "Use CPU for SAM" checkbox in the UI (slower but more stable)

**Memory Issues:**
- Use smaller SAM models (sam_vit_b or mobile_sam) if you run out of VRAM
- Lower the detection threshold to get fewer detections

## Contribute

Disclaimer: I have not thoroughly tested this extension, so there might be bugs. Bear with me while I'm fixing them :)

If you encounter a bug, please submit an issue. Please at least provide your WebUI version, your extension version, your browser version, errors on your browser console log if there is any, error on your terminal log if there is any, to save both of our time.

I welcome any contribution. Please submit a pull request if you want to contribute

## Star History

<a href="https://star-history.com/#continue-revolution/sd-webui-segment-anything&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=continue-revolution/sd-webui-segment-anything&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=continue-revolution/sd-webui-segment-anything&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=continue-revolution/sd-webui-segment-anything&type=Date" />
  </picture>
</a>


## Sponsor

You can sponsor me via WeChat, AliPay or PayPal.

| WeChat | AliPay | PayPal |
| --- | --- | --- |
| ![216aff0250c7fd2bb32eeb4f7aae623](https://user-images.githubusercontent.com/63914308/232824466-21051be9-76ce-4862-bb0d-a431c186fce1.jpg) | ![15fe95b4ada738acf3e44c1d45a1805](https://user-images.githubusercontent.com/63914308/232824545-fb108600-729d-4204-8bec-4fd5cc8a14ec.jpg) | ![IMG_1419_](https://github.com/continue-revolution/sd-webui-segment-anything/assets/63914308/0261a575-a43e-4dd1-98a6-0cfe8a3af78e) |
