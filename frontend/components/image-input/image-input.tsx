import { useRef } from "react";
import { Box, Button, FormControl, FormLabel } from "@mui/joy";

import imagePlaceholder from "@fe/assets/image_placeholder.webp";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ImageInput = ({ label, value, onChange }: ImageInputProps) => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    (hiddenFileInput.current as HTMLInputElement).click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    (async () => {
      const file = (event.target.files as FileList)[0];
      const base64 = await fileToBase64(file);
      onChange(base64);
    })();
  };

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Box
        sx={(theme) => ({
          width: "150px",
          height: "150px",
          backgroundImage: `url("${value || imagePlaceholder}")`,
          backgroundSize: value ? "contain" : "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          border: `1px solid ${theme.palette.neutral.outlinedBorder}`,
          borderRadius: "4px",
          marginBottom: 1,
        })}
      ></Box>
      <Button
        sx={{ width: "fit-content" }}
        onClick={handleImageUploadClick}
        color="neutral"
        variant="outlined"
      >
        Upload image
      </Button>
      <input
        ref={hiddenFileInput}
        onChange={handleImageUpload}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
      />
    </FormControl>
  );
};

export default ImageInput;
