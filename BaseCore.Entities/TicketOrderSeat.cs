namespace BaseCore.Entities
{
    public class TicketOrderSeat
    {
        public int Id { get; set; }
        public int OrderItemId { get; set; }
        public int SeatPlaceId { get; set; }
        public string SeatCode { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public TicketOrderItem OrderItem { get; set; }
        public SeatPlace SeatPlace { get; set; }
    }
}
