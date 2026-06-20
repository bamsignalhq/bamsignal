import { FastConnectionSheet } from "./profile/FastConnectionSheet";

type QuickiePaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  loading?: boolean;
  context?: "intent" | "message";
};

export function QuickiePaywallModal({
  open,
  onClose,
  onPay,
  loading
}: QuickiePaywallModalProps) {
  return (
    <FastConnectionSheet
      open={open}
      onClose={onClose}
      onContinuePayment={onPay}
      loading={loading}
    />
  );
}
