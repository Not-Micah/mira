import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onChange,
  title,
  children
}) => {
  return (
    <Dialog.Root open={isOpen} defaultOpen={isOpen} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-neutral-900/50 backdrop-blur-[1px] fixed inset-0 z-30" />
        <Dialog.Content className="fixed drop-shadow-md top-[50%] left-[50%] 
        max-h-full h-full md:h-auto md:max-h-[85vh] w-full md:w-[90vw] md:max-w-[700px]
        translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-[25px] focus:outline-none z-40">
            <Dialog.Title className="text-xl font-poppins text-center font-bold mb-4">
                {title}
            </Dialog.Title>
            <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
                {children}
            </div>
            <Dialog.Close asChild>
                <button className="text-neutral-400 hover:text-black absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] 
                appearance-none items-center justify-center rounded-full focus:outline-none">
                    <IoMdClose />
                </button>
            </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;